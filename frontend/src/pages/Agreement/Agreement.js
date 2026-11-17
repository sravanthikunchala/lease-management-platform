import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";
import "./Agreement.css";

const Agreement = () => {
  const location = useLocation();
  const customer_id = sessionStorage.getItem("customer_id");
  const { orderId } = location.state || {};
  const [agreementData, setAgreementData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch preview data
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/preview-agreement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drone_order_id: orderId ||
              "OD20250710163656Y1R2"
            // "OD20250707141802Y1T3"
            ,
            customer_id: customer_id
          })
        });

        const data = await response.json();
        if (response.ok) {
          setAgreementData(data);
        } else {
          setError(data.error || "Something went wrong");
        }
      } catch (err) {
        setError("Failed to fetch agreement preview");
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [orderId, customer_id]);

  // Generate final PDF
  const handleGenerateAgreement = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drone_order_id: orderId || "OD20250710163656Y1R2",
          customer_id: customer_id
        })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Agreement generated successfully.");
      } else {
        setError(data.error || "Agreement generation failed.");
      }
    } catch (err) {
      setError("Error generating agreement.");
    } finally {
      setGenerating(false);
    }
  };
const handleDownload = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/download-agreement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drone_order_id: orderId || "OD20250710163656Y1R2",
        customer_id: customer_id
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to get download link");
      return;
    }

    // Fetch the PDF blob from S3 pre‑signed URL
    const fileResponse = await fetch(data.download_url);
    const blob = await fileResponse.blob();

    // Create object URL and download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agreement_${orderId}.pdf`; // desired file name
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Free memory
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Something went wrong while downloading agreement.");
  }
};


  if (loading) return <div>Loading agreement preview...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!agreementData) return null;

  // Extract from API
  const agreement = agreementData.preview || {};
  const lessor = agreementData.lessor || {};
  const bank = agreementData.bank_details || {};
  const nominees = agreementData.nominees || [];
const company = agreementData.company_details || {};

  return (
    <div className="agreement-body container">
      <div className="agreement-header">DRONE LEASE AGREEMENT</div>

      <table className="info-table">
        <tbody>
          <tr>
            <td><strong>Agreement No:</strong> <b>{agreement.agreement_no}</b></td>
            <td><strong>Date:</strong> <b>{agreement.agreement_date}</b></td>
          </tr>
        </tbody>
      </table>

      <p>
        This Drone Lease Agreement is executed on this <b>{agreement.agreement_day} day of {agreement.agreement_month}, {agreement.agreement_year_full} </b>by and between:
      </p>

      <p>
        <strong>Mr./Ms. {lessor.name}</strong>, Son/Wife/Daughter of <strong>{lessor.guardian_name || "__________"}</strong>, aged about <b>{lessor.age}years, </b> resident of {lessor.resident_of}, <b>(PAN: {lessor.pan_number}) (Aadhaar No.: {lessor.aadhaar_number})</b> (hereinafter called the <strong>Lessor</strong>).
      </p>

      <p>And</p>

      <p>
        <strong>Pavaman Agri Ventures Pvt Ltd</strong>, CIN: U01100TG2022PTC159856, having registered office at 2nd Floor, Kapil Kavuri Hub, Nanakramguda, Seri Lingampally, Telangana, India – 500032, represented by its Authorised Representative (hereinafter called the <strong>Lessee</strong>).
      </p>

      <div className="section-title">SCHEDULE</div>
      <div className="clause">
        The Lessor has purchased {agreement.drone_quantity} Drone(s) ({agreement.drone_name}) through <b>Invoice No: {agreement.invoice_number_str}</b>, Dated: <b>{agreement.invoice_date_str}</b>, Amount:<b>₹{agreement.total_invoice_amount}</b> . Drone Unique Code(s): <b>{agreement.drone_unique_code}</b>.
      </div>

      <div className="section-title">1. Period</div>
      <div className="clause">
        The lease shall be for a period of 66 months, commencing from <b>{agreement.from_date} to {agreement.to_date}</b>.
      </div>

      <div className="section-title">2. Rental</div>
      <div className="clause">
        The Lessee shall pay:
        <ul>
          <li>₹25,000/- monthly (inclusive of GST/TDS), within 10 days after each month for 66 months; OR</li>
          <li>₹22,44,000/- (₹34,000/month for 66 months) at the end of 64 months, payable at the end of 66 months, subject to TDS deductions.</li>
        </ul>
        In case of early termination, the rent shall revert to ₹25,000/- per month.
      </div>

      <div className="section-title">3. Residual Value</div>
      <div className="clause">
        The residual value at the end of the lease is ₹1,56,000/- per drone. The Lessee may purchase the drone in "as-is" condition in the 67th month.
      </div>

      <div className="section-title">4. Taxes</div>
      <div className="clause">Taxes shall be deducted as applicable.</div>

      <div className="section-title">5. Termination by Lessor</div>
      <div className="clause">
        The lease may be terminated by the Lessor with 45 days’ written notice if:
        <ol type="i">
          <li>The Lessee fails to pay rent for 3 consecutive months.</li>
          <li>The Lessee is declared insolvent.</li>
          <li>Or, for any reason, with 3 months’ advance written notice.</li>
        </ol>
        On termination, the Lessee shall return the drone to the Lessor at Survey No. 121, Sreeramnagar, Moinabad Mandal, Rangareddy – 500075, and settle any pending dues.
      </div>

      <div className="section-title">6-12. Additional Clauses</div>
      <div className="clause">
        <strong>6.</strong> Rights of the Lessor are non-transferable without Lessee’s written consent.<br />
        <strong>7.</strong> A 1% monthly penalty applies for rent payment delays.<br />
        <strong>8.</strong> All operational risks lie with the Lessee during the lease period.<br />
        <strong>9.</strong> The Lessor may inspect the drone with 3 days' prior written notice.<br />
        <strong>10.</strong> Notices must be in writing and sent to registered addresses.<br />
        <strong>11.</strong> This agreement is binding and can only be amended in writing.<br />
        <strong>12.</strong> Disputes unresolved within 15 days will be settled by arbitration under the Arbitration and Conciliation Act, 1996. Jurisdiction: Rangareddy District Courts.
      </div>

      <div className="section-title">ANNEXURE – LEASE PAYMENT DETAILS</div>

      <div className="clause">
        <strong>Account No:</strong> {bank.account_number} <br />
        <strong>Name of Account Holder:</strong> {bank.account_holder_name} <br />
        <strong>Name of Bank:</strong> {bank.bank_name} <br />
        <strong>IFSC Code:</strong> {bank.ifsc_code}
      </div>

      <div className="section-title">DETAILS OF NOMINEE</div>
      <table className="nominee-table">
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Name</th>
            <th>Relationship</th>
            <th>Address</th>
            <th>Proportionate %</th>
          </tr>
        </thead>
        <tbody>
          {nominees.map((n, idx) => (
            <tr key={idx}>
              <td>{n.sno}</td>
              <td>{n.nominee_name}</td>
              <td>{n.nominee_relation}</td>
              <td>{n.nominee_address || "-"}</td>
              <td>{n.nominee_share}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="signature-section">
        <div className="signature-box">
          <strong><img src={agreement.customer_signature_url} className="logo" alt="Sign" />
            <br />Lessor</strong>
        </div>
        <div className="signature-box">
          <img src={company.signature} className="logo" alt="Sign" />
          <img src={company.stamp} className="logo" alt="Sign" /><br />
          <strong>Authorised Signatory<br />Pavaman Agri Ventures Pvt Ltd</strong><br />

        </div>
      </div>

      <div className="generate-div">
        <button onClick={handleGenerateAgreement} disabled={generating} className="primary-button">
          {generating ? "Generating..." : "Generate Agreement"}
        </button>
        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
      </div>

      <div>
        <button onClick={handleDownload} className="primary-button">
          📄 Download Agreement
        </button>
      </div>
    </div>
  );
};

export default Agreement;
