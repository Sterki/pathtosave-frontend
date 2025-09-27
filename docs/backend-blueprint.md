## Backend Blueprint Symfony para conectar con Supabase

Este documento guía la implementación del backend en Symfony para la app de gastos. La base de datos y seguridad a nivel de filas se gestionan en Supabase (PostgreSQL) mediante `docs/supabase.sql`.

### 1. Requisitos

- PHP 8.2+
- Composer 2.7+
- Symfony 6.4/7
- DSN a Supabase Postgres (host, port, db, user, password, sslmode=require)

### 2. Instalación y configuración inicial

```bash
composer create-project symfony/skeleton expenses-backend
cd expenses-backend
composer require symfony/orm-pack symfony/maker-bundle --dev
composer require api-platform/core doctrine/doctrine-bundle
composer require firebase/php-jwt symfony/security-bundle
```

### 3. Configuración de base de datos

`.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

`config/packages/doctrine.yaml`:

```yaml
doctrine:
  dbal:
    types:
      uuid: Ramsey\Uuid\Doctrine\UuidType
  orm:
    auto_generate_proxy_classes: true
    enable_lazy_ghost_objects: true
    mappings:
      App:
        is_bundle: false
        dir: "%kernel.project_dir%/src/Entity"
        prefix: 'App\Entity'
        alias: App
```

### 4. Entidades Doctrine

**Profile.php** (`src/Entity/Profile.php`):

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\UuidInterface;

#[ORM\Entity]
#[ORM\Table(name: 'profiles')]
class Profile
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid')]
    private UuidInterface $userId;

    #[ORM\Column(type: 'citext')]
    private string $email;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $displayName = null;

    #[ORM\Column(type: 'string', length: 3, options: ['default' => 'USD'])]
    private string $currency = 'USD';

    #[ORM\Column(type: 'string', options: ['default' => 'UTC'])]
    private string $timezone = 'UTC';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }
}
```

**Category.php** (`src/Entity/Category.php`):

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\UuidInterface;

#[ORM\Entity]
#[ORM\Table(name: 'categories')]
class Category
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid')]
    private UuidInterface $id;

    #[ORM\Column(type: 'uuid')]
    private UuidInterface $userId;

    #[ORM\Column(type: 'string')]
    private string $name;

    #[ORM\Column(type: 'string')]
    #[Assert\Choice(choices: ['expense', 'income'])]
    private string $type;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $color = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $icon = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isArchived = false;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $sortOrder = 0;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = \Ramsey\Uuid\Uuid::uuid4();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }
}
```

**Budget.php**, **Expense.php**, **Income.php** siguen el mismo patrón con sus respectivos campos.

### 5. Autenticación JWT Supabase

**SupabaseJwtAuthenticator.php** (`src/Security/SupabaseJwtAuthenticator.php`):

```php
<?php

namespace App\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class SupabaseJwtAuthenticator extends AbstractAuthenticator
{
    private string $supabaseJwtSecret;

    public function __construct(string $supabaseJwtSecret)
    {
        $this->supabaseJwtSecret = $supabaseJwtSecret;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization') &&
               str_starts_with($request->headers->get('Authorization'), 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization'));

        try {
            $payload = JWT::decode($token, new Key($this->supabaseJwtSecret, 'HS256'));
            $userId = $payload->sub ?? null;

            if (!$userId) {
                throw new AuthenticationException('Invalid token');
            }

            return new SelfValidatingPassport(new UserBadge($userId));
        } catch (\Exception $e) {
            throw new AuthenticationException('Invalid token');
        }
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
    }
}
```

**security.yaml**:

```yaml
security:
  providers:
    app_user_provider:
      id: App\Security\SupabaseUserProvider

  firewalls:
    api:
      pattern: ^/api
      stateless: true
      custom_authenticators:
        - App\Security\SupabaseJwtAuthenticator

  access_control:
    - { path: ^/api, roles: ROLE_USER }
```

### 6. API Platform Resources

**CategoryResource.php** (`src/ApiResource/CategoryResource.php`):

```php
<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Entity\Category;
use App\State\CategoryProcessor;
use App\State\CategoryProvider;

#[ApiResource(
    operations: [
        new GetCollection(provider: CategoryProvider::class),
        new Post(processor: CategoryProcessor::class),
        new Get(provider: CategoryProvider::class),
        new Put(processor: CategoryProcessor::class),
        new Patch(processor: CategoryProcessor::class),
        new Delete(processor: CategoryProcessor::class),
    ],
    normalizationContext: ['groups' => ['category:read']],
    denormalizationContext: ['groups' => ['category:write']]
)]
class CategoryResource
{
    public string $id;
    public string $name;
    public string $type;
    public ?string $color = null;
    public ?string $icon = null;
    public bool $isArchived = false;
    public int $sortOrder = 0;
}
```

### 7. State Providers y Processors

**CategoryProvider.php** (`src/State/CategoryProvider.php`):

```php
<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class CategoryProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $user = $this->security->getUser();
        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        if (isset($uriVariables['id'])) {
            return $this->em->getRepository(Category::class)->findOneBy([
                'id' => $uriVariables['id'],
                'userId' => $user->getUserIdentifier()
            ]);
        }

        return $this->em->getRepository(Category::class)->findBy([
            'userId' => $user->getUserIdentifier()
        ]);
    }
}
```

### 8. Controladores para Dashboard

**DashboardController.php** (`src/Controller/DashboardController.php`):

```php
<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/v1/dashboard')]
class DashboardController extends AbstractController
{
    public function __construct(private Connection $connection) {}

    #[Route('/summary', methods: ['GET'])]
    public function summary(Request $request): JsonResponse
    {
        $from = $request->query->get('from', date('Y-m-01'));
        $to = $request->query->get('to', date('Y-m-t'));

        $result = $this->connection->executeQuery(
            'SELECT * FROM public.summary(?, ?)',
            [$from, $to]
        )->fetchAssociative();

        return $this->json($result);
    }

    #[Route('/daily-spend', methods: ['GET'])]
    public function dailySpend(Request $request): JsonResponse
    {
        $month = $request->query->get('month', date('Y-m-01'));

        $results = $this->connection->executeQuery(
            'SELECT * FROM public.daily_spend(?)',
            [$month]
        )->fetchAllAssociative();

        return $this->json(['days' => $results]);
    }

    #[Route('/expenses/by-category', methods: ['GET'])]
    public function expensesByCategory(Request $request): JsonResponse
    {
        $from = $request->query->get('from', date('Y-m-01'));
        $to = $request->query->get('to', date('Y-m-t'));

        $results = $this->connection->executeQuery(
            'SELECT * FROM public.expenses_by_category(?, ?)',
            [$from, $to]
        )->fetchAllAssociative();

        return $this->json($results);
    }
}
```

### 9. Validaciones

**CategoryDto.php** (`src/Dto/CategoryDto.php`):

```php
<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class CategoryDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 100)]
    public string $name;

    #[Assert\Choice(choices: ['expense', 'income'])]
    public string $type;

    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/')]
    public ?string $color = null;

    #[Assert\Length(max: 50)]
    public ?string $icon = null;
}
```

### 10. Configuración de servicios

**services.yaml**:

```yaml
services:
  _defaults:
    autowire: true
    autoconfigure: true

  App\:
    resource: "../src/"
    exclude:
      - "../src/DependencyInjection/"
      - "../src/Entity/"
      - "../src/Kernel.php"

  App\Security\SupabaseJwtAuthenticator:
    arguments:
      $supabaseJwtSecret: "%env(SUPABASE_JWT_SECRET)%"
```

### 11. Variables de entorno

`.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
```

### 12. Rutas personalizadas

**routes.yaml**:

```yaml
api_dashboard:
  resource: "../src/Controller/DashboardController.php"
  type: attribute
  prefix: /api/v1
```

### 13. Testing

**CategoryTest.php** (`tests/Controller/CategoryTest.php`):

```php
<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CategoryTest extends WebTestCase
{
    public function testGetCategories(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/categories', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer your-test-jwt-token'
        ]);

        $this->assertResponseIsSuccessful();
    }
}
```

### 14. Tareas de implementación

1. **Configurar proyecto**: `composer create-project` y dependencias
2. **Mapear entidades**: Crear todas las entidades Doctrine
3. **Implementar autenticación**: SupabaseJwtAuthenticator y UserProvider
4. **Configurar API Platform**: Resources, Providers, Processors
5. **Crear controladores dashboard**: Conectar con RPCs de Supabase
6. **Añadir validaciones**: DTOs y constraints
7. **Configurar testing**: Tests de integración
8. **Documentar API**: OpenAPI con API Platform

### 15. Comandos útiles

```bash
# Crear entidad
php bin/console make:entity

# Generar migraciones (NO ejecutar - usar supabase.sql)
php bin/console doctrine:migrations:diff

# Limpiar caché
php bin/console cache:clear

# Ejecutar tests
php bin/console test
```

Referencia: ver `docs/supabase.sql` para el esquema, RLS y RPCs listos.

