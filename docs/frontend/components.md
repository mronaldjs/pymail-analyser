# Web Interface Components

The frontend is built using a simplified **Atomic Design** pattern and relies on components from the **shadcn/ui** library.

## 🎨 Navigation Flow

The WebApp uses state to switch between the main screens:

1.  **Login Screen (`'email'`)**: Captures the email address and automatically infers the IMAP host.
2.  **Credentials Screen (`'credentials'`)**: Requests the app password and analysis period.
3.  **Dashboard Screen**: Displays the analysis results.

## 🧱 Key Components

### `SpamRiskBadge`
A visual component that shows risk level (High/Medium/Low) with semantic colors:
- 🟠 **High**: Likely spam.
- 🟡 **Medium**: Moderate risk.
- 🟢 **Low**: Likely official/trusted.

### `Dashboard (Home)`
The `app/page.tsx` file manages most of the application state:
- **TanStack Query**: Handles asynchronous requests (`analyzeMutation` and `actionMutation`).
- **View Modes**: Toggles between **List** view (detailed table) and **Grid** view (visual cards).
- **Bulk Selection**: Allows selecting multiple senders for bulk actions.

### `ThemeToggle`
Enables switching between **Dark** and **Light** themes, synced with system preferences.

## 🧬 Hooks and State
The project uses `useState` for UI control and `useMutation` for backend actions, ensuring the interface stays reactive to the latest data.
