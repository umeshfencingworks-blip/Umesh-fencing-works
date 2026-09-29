"use client";

import React, { useState, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { extractStateCode, INDIAN_STATES } from "@/lib/calculations";
import { saveCustomer } from "@/lib/db";
import { X, Building2, User, Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export default function CustomerModal() {
  const { isCustomerModalOpen, closeCustomerModal, customerModalData, showToast } = useUI();

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [stateCode, setStateCode] = useState("37");

  useEffect(() => {
    if (customerModalData) {
      setCompany(customerModalData.company || "");
      setName(customerModalData.name || "");
      setPhone(customerModalData.phone || "");
      setEmail(customerModalData.email || "");
      setGstin(customerModalData.gstin || "");
      setBillingAddress(customerModalData.billingAddress || "");
      setShippingAddress(customerModalData.shippingAddress || "");
      setState(customerModalData.state || "Andhra Pradesh");
      setStateCode(customerModalData.stateCode || "37");
    } else {
      setCompany("");
      setName("");
      setPhone("");
      setEmail("");
      setGstin("");
      setBillingAddress("");
      setShippingAddress("");
      setState("Andhra Pradesh");
      setStateCode("37");
    }
  }, [customerModalData, isCustomerModalOpen]);

  // Real-time state code derivation from GSTIN
  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase();
    setGstin(val);
    if (val.length >= 2) {
      const derivedCode = extractStateCode(val);
      setStateCode(derivedCode);
      const match = INDIAN_STATES.find((s) => s.code === derivedCode);
      if (match) {
        setState(match.name);
      }
    }
  };

  if (!isCustomerModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() && !company.trim()) {
      showToast("Please enter a Contact Name or Company Name.", "error");
      return;
    }

    const payload = {
      ...(customerModalData?.id ? { id: customerModalData.id } : {}),
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gstin: gstin.trim().toUpperCase(),
      billingAddress: billingAddress.trim(),
      shippingAddress: (shippingAddress || billingAddress).trim(),
      state: state.trim(),
      stateCode: stateCode.trim(),
    };

    try {
      const saved = await saveCustomer(payload);
      showToast(`Customer "${saved.company || saved.name}" saved successfully.`, "success");
      closeCustomerModal();
    } catch (err) {
      console.error(err);
      showToast("Failed to save customer. Please try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#0E1C2F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1C314D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1C314D] border border-[#B45309] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#FDE68A]" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {customerModalData ? "Edit Customer Record" : "Register Commercial Customer"}
              </h2>
              <div className="text-xs text-[#98A2B3]">
                Full GSTIN validation &amp; Andhra Pradesh State 37 Code
              </div>
            </div>
          </div>
          <button
            onClick={closeCustomerModal}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#FBF9F5]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Company / Trade Name (B2B)
              </label>
              <input
                type="text"
                placeholder="e.g. Sri Balaji Agro Farms & Infrastructure"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. B. Ramesh Babu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Phone / Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98490 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1 flex items-center justify-between">
                <span>GST Number <span className="text-[#B45309] font-normal lowercase">(optional)</span></span>
                <span className="text-[9px] text-[#667085] font-mono">15-char code (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="37AAACB4512C1Z8 (Optional)"
                maxLength={15}
                value={gstin}
                onChange={handleGstinChange}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white font-mono uppercase font-bold text-[#0E1C2F]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                State (Select from All States of India)
              </label>
              <select
                value={state}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setState(selectedName);
                  const found = INDIAN_STATES.find((s) => s.name === selectedName);
                  if (found) {
                    setStateCode(found.code);
                  }
                }}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white text-xs font-semibold text-[#0E1C2F]"
                required
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                GST State Code
              </label>
              <input
                type="text"
                maxLength={2}
                value={stateCode}
                readOnly
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono font-bold text-center text-[#0E1C2F]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Billing Address (Factory / Office)
              </label>
              <textarea
                rows="2"
                placeholder="Plot / Street / Mandal / District / PIN Code"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
                required
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Shipping / Delivery Site Address (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Leave blank to use same as Billing Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5DD]">
            <button
              type="button"
              onClick={closeCustomerModal}
              className="px-4 py-2 rounded-md border border-[#DCD7CD] bg-white text-[#344054] text-xs font-semibold hover:bg-[#F2EFE8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-[#FDE68A]" />
              <span>{customerModalData ? "Save Changes" : "Register Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
