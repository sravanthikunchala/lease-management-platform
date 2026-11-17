import API_BASE_URL from "../config";

export const fetchAgreementPreview = async (orderId, customerId) => {
  const response = await fetch(`${API_BASE_URL}/preview-agreement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      drone_order_id: orderId || "OD20250709150921HCRO",
      customer_id: customerId
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch agreement preview");
  return data;
};

export const generateAgreement = async (orderId, customerId) => {
  const response = await fetch(`${API_BASE_URL}/generate-agreement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      drone_order_id: orderId,
      customer_id: customerId
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to generate agreement");
  return data;
};
