# Componentes e Interface Web

O frontend foi construído seguindo o padrão de **Atomic Design** simplificado, utilizando componentes da biblioteca **shadcn/ui**.

## 🎨 Fluxo de Navegação

O WebApp utiliza um sistema de estados para alternar entre as telas principais:

1.  **Tela de Login (`'email'`)**: Captura o endereço de e-mail e infere o host IMAP automaticamente.
2.  **Tela de Credenciais (`'credentials'`)**: Solicita a senha (de app) e o período de análise.
3.  **Tela de Dashboard**: Exibe os resultados da análise.

## 🧱 Principais Componentes

### `SpamRiskBadge`
Um componente visual que exibe o nível de risco (High/Medium/Low) com cores semânticas:
- 🟠 **High**: Provavelmente spam.
- 🟡 **Medium**: Risco médio.
- 🟢 **Low**: Provavelmente oficial/confiável.

### `Dashboard (Home)`
O arquivo `app/page.tsx` gerencia todo o estado da aplicação:
- **TanStack Query**: Gerencia as requisições assíncronas (`analyzeMutation` e `actionMutation`).
- **Visualização**: Alterna entre os modos **Lista** (tabela detalhada) e **Grade** (cards visuais).
- **Seleção em Lote**: Permite selecionar múltiplos remetentes para ações simultâneas.

### `ThemeToggle`
Permite alternar entre os temas **Dark** e **Light**, sincronizando com a preferência do sistema operacional.

## 🧬 Hooks e Estado
O projeto utiliza o hook `useState` para controle de interface e `useMutation` para interações com o backend, garantindo que a UI seja sempre reativa aos dados mais recentes.
