# BusinessMap Cards Viewer

Uma aplicação completa para visualizar iniciativas e histórias do BusinessMap, seguindo princípios de Clean Architecture e SOLID.

## Arquitetura

### Backend (Node.js + TypeScript)
- **Clean Architecture** com separação clara de responsabilidades
- **Domain Layer**: Entidades e interfaces
- **Use Cases**: Lógica de negócio
- **Infrastructure**: Adapters e repositories
- **Presentation**: Controllers e rotas

### Frontend (React + TypeScript)
- Interface moderna e responsiva
- Componentes reutilizáveis
- Estado gerenciado com hooks
- Integração com API REST

## Funcionalidades

- ✅ Busca cards com `type_id = 1` (História) e `type_id = 2` (Iniciativa)
- ✅ Exibe relação pai-filho entre iniciativas e histórias
- ✅ Interface responsiva e intuitiva
- ✅ Estados de loading e error
- ✅ Contadores de iniciativas e histórias

## Como executar

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### 1. Instalar dependências do Backend
```bash
npm install
```

### 2. Instalar dependências do Frontend
```bash
cd frontend
npm install
cd ..
```

### 3. Executar o Backend
```bash
npm run dev
```
O servidor estará disponível em `http://localhost:3001`

### 4. Executar o Frontend (novo terminal)
```bash
cd frontend
npm start
```
A aplicação estará disponível em `http://localhost:3000`

## Endpoints da API

- `GET /api/cards/initiatives` - Retorna todas as iniciativas com suas histórias filhas
- `GET /health` - Health check do servidor

## Estrutura do Projeto

```
bmap-api/
├── src/
│   ├── domain/
│   │   ├── entities/          # Entidades do domínio
│   │   └── interfaces/        # Contratos
│   ├── usecases/             # Casos de uso
│   ├── infrastructure/
│   │   ├── adapters/         # Adaptadores externos
│   │   └── repositories/     # Implementações de repositórios
│   └── presentation/
│       ├── controllers/      # Controladores
│       └── routes/           # Definição de rotas
├── frontend/
│   └── src/
│       ├── components/       # Componentes React
│       ├── services/         # Serviços de API
│       └── types/           # Tipos TypeScript
└── README.md
```

## Principios Aplicados

### SOLID
- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Liskov Substitution**: Substituição de implementações via interfaces
- **Interface Segregation**: Interfaces específicas e focadas
- **Dependency Inversion**: Dependências invertidas via DI

### Clean Architecture
- **Separação de camadas** com dependências apontando para dentro
- **Domain** independente de frameworks e bibliotecas externas
- **Use Cases** contendo a lógica de negócio
- **Adapters** para comunicação externa