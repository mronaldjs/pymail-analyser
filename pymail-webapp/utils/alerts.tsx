export function popUpAlert(message: string, type: "success" | "error" | "info" = "info") {
  const alertContainer = document.createElement("div");
  alertContainer.className = `fixed top-4 right-4 z-50 p-4 rounded shadow-lg text-white ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  alertContainer.textContent = message;

  document.body.appendChild(alertContainer);

  setTimeout(() => {
    alertContainer.remove();
  }, 3000);
}