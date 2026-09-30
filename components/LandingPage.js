"use client";

import React, { useState } from "react";
import {
  Layers,
  ShieldCheck,
  Building,
  Zap,
  Package,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Calculator,
  Send,
  Check,
  Shield,
  Truck,
  Compass,
  BookOpen,
  Lock,
  Clock,
  X,
  ShieldAlert,
  Ban,
} from "lucide-react";
import { BUSINESS_DETAILS } from "@/lib/calculations";
import { useUI } from "@/context/UIContext";

export default function LandingPage() {
  const {
    isAdminAuthenticated,
    loginWithGoogle,
    primaryAdminEmail,
    unauthorizedEmailAttempt,
    dismissUnauthorizedModal,
    navigate,
    showToast,
  } = useUI();

  // Google Authentication State for Footer Ledger Access
  const [showLedgerAuthModal, setShowLedgerAuthModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLedgerClick = () => {
    if (isAdminAuthenticated) {
      navigate("/admin-controls?tab=financial-ledger");
    } else {
      setShowLedgerAuthModal(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        setShowLedgerAuthModal(false);
        navigate("/admin-controls?tab=financial-ledger");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Interactive Quotation State for Prospective Clients
  const [fencingType, setFencingType] = useState("chainlink");
  const [perimeterLength, setPerimeterLength] = useState("500");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  // Core Product & Service Offerings
  const productOfferings = [
    {
      id: "chainlink",
      title: "Galvanised (GI) Chain Link Mesh",
      specs: "8G to 14G Wire • 1.5\" to 4\" Diamond Mesh",
      desc: "Precision machine-woven chain link wire nets manufactured with certified high-tensile galvanised iron wire. Engineered with hot-dip zinc coating (100–120 GSM) for rust-free outdoor resilience across agricultural and industrial boundaries.",
      icon: Layers,
      highlight: "15-Year Rust-Free Guarantee",
      features: [
        "Available in 3ft to 12ft roll heights",
        "Uniform diamond mesh with knuckled/twisted edges",
        "PVC coated options available (Green/Blue)",
        "High resistance to weathering and soil corrosion",
      ],
      idealFor: "Farms, Orchards, Solar Parks, Highways & Compound Walls",
    },
    {
      id: "barbed-wire",
      title: "High-Tensile Barbed Wire",
      specs: "12x12 & 12x14 Gauge • 4-Point Sharp Barbs",
      desc: "Heavy-duty security barbed wire twisted uniformly with razor-sharp 4-point barbs spaced at precise intervals. Built to stop trespassing, cattle grazing, and wildlife encroachment with impenetrable boundary defence.",
      icon: ShieldCheck,
      highlight: "High Zinc Galvanised",
      features: [
        "4-point barbs with locking reverse twists",
        "High tensile steel core wire prevents sagging",
        "Heavy zinc galvanisation prevents premature rusting",
        "Supplied in manageable, standard-weight bundles",
      ],
      idealFor: "Agricultural Land, Boundary Walls & Anti-Intrusion Barriers",
    },
    {
      id: "poles",
      title: "Precast Vibrated Concrete Poles",
      specs: "6ft to 10ft Heights • Reinforced M25/M30 RCC",
      desc: "Factory-cast concrete fencing posts manufactured on high-frequency vibrating tables with M25/M30 grade concrete and 3–4 high-yield steel rebars. Pre-formed eyelet holes allow instant wire threading and tensioning.",
      icon: Building,
      highlight: "Vibrated Steel Reinforced",
      features: [
        "Available in 6ft, 7ft, 8ft, 9ft & 10ft lengths",
        "4\"x4\" square & heavy-duty corner strainer sections",
        "Termite-proof, fireproof & immune to rotting",
        "Pre-drilled hook holes for rapid, labor-saving erection",
      ],
      idealFor: "Permanent Farm Fencing, Stone Post Replacement & Boundary Markers",
    },
    {
      id: "solar",
      title: "Agricultural Solar Power Fencing",
      specs: "Govt-Compliant Non-Lethal Energizers",
      desc: "Complete solar perimeter protection system that generates non-lethal, high-voltage deterrent pulses. Safely protects valuable crop yields against wild boars, nilgai, deer, and monkeys without causing permanent harm to wildlife.",
      icon: Zap,
      highlight: "Crops & Wildlife Safe",
      features: [
        "High-voltage DC energizer with backup battery",
        "Monocrystalline solar charging panel",
        "Heavy porcelain insulators & tension springs",
        "Audible alarm siren on fence tampering or wire break",
      ],
      idealFor: "Horticulture Farms, Mango Orchards & Commercial Agro Estates",
    },
    {
      id: "gates",
      title: "GI Tubular Farm & Factory Gates",
      specs: "Heavy GI Pipe Frames with Chainlink Infill",
      desc: "Custom manufactured vehicular and pedestrian entrance gates built from heavy-gauge galvanised iron tubular pipes. Fitted with industrial-grade sliding hinges, locking drop-bolts, and chain link or wire mesh infill.",
      icon: Package,
      highlight: "Custom Field Sizing",
      features: [
        "Single-leaf and double-leaf swing gate designs",
        "Heavy-duty greaseable hinge pins for smooth operation",
        "Pre-welded padlock hasps and ground locking rods",
        "Custom fabricated to match tractor & truck entrance widths",
      ],
      idealFor: "Farm Entrances, Factory Gates & Warehouse Compounds",
    },
    {
      id: "turnkey",
      title: "Turnkey Installation & Erection Service",
      specs: "On-Site Survey, Post Grouting & Wire Tensioning",
      desc: "Full end-to-end fencing installation carried out by experienced fencing specialists. We handle site boundary measurement, pit digging, pole alignment, cement grouting, and hydraulic wire tensioning across South India.",
      icon: Award,
      highlight: "Complete Turnkey Delivery",
      features: [
        "Free preliminary site measurement and cost estimation",
        "Laser-aligned post placement and corner bracing",
        "High-tension mechanical wire stretching without sag",
        "Prompt, professional execution by trained crew",
      ],
      idealFor: "Large Acreage Farms, Infrastructure Projects & Commercial Plots",
    },
  ];

  // Technical Specifications Matrix
  const specMatrix = [
    {
      gauge: "8 Gauge (4.0 mm)",
      meshSizes: "2\", 2.5\", 3\", 4\"",
      coating: "Hot-Dip Galvanised (100–120 GSM)",
      tensile: "600–750 N/mm²",
      application: "Industrial Complexes, Highways, Heavy Perimeter Security",
    },
    {
      gauge: "10 Gauge (3.2 mm)",
      meshSizes: "2\", 2.5\", 3\"",
      coating: "Heavy Zinc GI Coating (90–110 GSM)",
      tensile: "550–700 N/mm²",
      application: "Solar Power Plants, Commercial Estates, High-Grade Farms",
    },
    {
      gauge: "12 Gauge (2.5 mm)",
      meshSizes: "1.5\", 2\", 2.5\"",
      coating: "Standard Galvanised (70–90 GSM)",
      tensile: "500–650 N/mm²",
      application: "Agricultural Land, Mango & Coconut Orchards, Cattle Protection",
    },
    {
      gauge: "14 Gauge (2.0 mm)",
      meshSizes: "1.5\", 2\"",
      coating: "Commercial GI Coating",
      tensile: "450–600 N/mm²",
      application: "Poultry Farms, Garden Enclosures, Light Enclosure Fencing",
    },
  ];

  // Handle WhatsApp / Call Direct Inquiry
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Please provide your Name and Phone Number.");
      return;
    }

    const typeLabels = {
      chainlink: "GI Chain Link Mesh",
      "barbed-wire": "High-Tensile Barbed Wire",
      poles: "Precast Concrete Poles",
      solar: "Agricultural Solar Fencing",
      gates: "Custom GI Gates",
      turnkey: "Complete Turnkey Erection",
    };

    const selectedProduct = typeLabels[fencingType] || fencingType;
    const message = encodeURIComponent(
      `Hello Umesh Fencing Works,\n\nI would like a quotation for:\n• Product: ${selectedProduct}\n• Approximate Length: ${perimeterLength} feet\n• Name: ${clientName}\n• Phone: ${clientPhone}\n• Site Location: ${clientLocation || "Not specified"}\n\nPlease share your factory direct rates and availability.`
    );

    const whatsappUrl = `https://wa.me/919440857111?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setInquirySent(true);
  };

  return (
    <div className="w-full space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0E1C2F] via-[#12233B] to-[#182C4A] text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-[#1C314D] shadow-sm">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#FDE68A 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Quality Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FEF3C7] text-xs font-semibold tracking-wide backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse"></span>
            <span>Premier Fencing Manufacturer • Bukkarayasamudram, Anantapur, AP</span>
          </div>

          {/* Logo Showcase */}
          <div className="flex justify-center mb-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-3 border-[#C28E3A] p-1 shadow-2xl overflow-hidden transition-transform hover:scale-105">
              <img
                src="/assets/umesh_logo.jpg"
                alt="Umesh Fencing Works"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif">
            Umesh Fencing Works
            <span className="block text-xl sm:text-3xl font-sans font-medium text-[#FDE68A] mt-2 sm:mt-3">
              Heavy-Duty Fencing Solutions for Farms, Industries &amp; Infrastructure
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Direct manufacturers of heavy galvanised (GI) chain link wire mesh, razor-sharp high-tensile barbed wire, machine-vibrated precast concrete poles, and solar farm protection. Supplying certified quality materials at factory direct wholesale rates across Andhra Pradesh and South India.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <a
              href="#contact"
              className="px-6 py-3 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Calculator className="w-4 h-4 text-[#FDE68A]" />
              <span>Get Free Quotation</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="tel:+919440857111"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 transition-all flex items-center justify-center gap-2 backdrop-blur-xs"
            >
              <Phone className="w-4 h-4 text-[#FDE68A]" />
              <span>Call Factory: +91 94408 57111</span>
            </a>

            <a
              href="https://wa.me/919440857111?text=Hi%20Umesh%20Fencing%20Works,%20I%20need%20a%20quotation%20for%20fencing%20materials."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#86EFAC] font-bold text-xs sm:text-sm border border-[#25D366]/40 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#86EFAC]" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Quick Value Pillars */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[#FDE68A] font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>15-Year Anti-Rust</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Heavy zinc GI coating</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[#FDE68A] font-bold text-xs flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Factory Direct Rates</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Zero middleman margins</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[#FDE68A] font-bold text-xs flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Reinforced RCC Poles</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">M25/M30 vibrated concrete</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[#FDE68A] font-bold text-xs flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Turnkey Erection</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Full on-site installation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Manufacturing Facility Credentials Strip */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-[#DCD7CD] shadow-sm p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Facility Location */}
          <div className="flex items-start gap-3 p-3.5 bg-[#FBF9F5] rounded-xl border border-[#E8E5DD]">
            <div className="p-2.5 rounded-lg bg-[#0E1C2F] text-[#FDE68A] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                Works &amp; Factory Site
              </div>
              <div className="font-bold text-[#0E1C2F] text-xs sm:text-sm mt-0.5 leading-snug">
                Survey No. 87/9, Near HLC Canal
              </div>
              <div className="text-[11px] text-[#475467]">Bukkarayasamudram, Anantapur - 515701</div>
            </div>
          </div>

          {/* Contact Direct */}
          <div className="flex items-start gap-3 p-3.5 bg-[#FBF9F5] rounded-xl border border-[#E8E5DD]">
            <div className="p-2.5 rounded-lg bg-[#0E1C2F] text-[#FDE68A] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                Proprietor Direct
              </div>
              <div className="font-bold text-[#0E1C2F] text-xs sm:text-sm mt-0.5">
                {BUSINESS_DETAILS.proprietor}
              </div>
              <div className="text-[11px] font-mono text-[#B45309] font-bold">
                {BUSINESS_DETAILS.phone}
              </div>
            </div>
          </div>

          {/* Production Capacity */}
          <div className="flex items-start gap-3 p-3.5 bg-[#FBF9F5] rounded-xl border border-[#E8E5DD]">
            <div className="p-2.5 rounded-lg bg-[#0E1C2F] text-[#FDE68A] shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                Manufacturing Capacity
              </div>
              <div className="font-bold text-[#0E1C2F] text-xs sm:text-sm mt-0.5">
                Daily Automatic Weaving
              </div>
              <div className="text-[11px] text-[#475467]">Over 5,000 sq ft chainlink &amp; 300+ posts/day</div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-3 p-3.5 bg-[#FBF9F5] rounded-xl border border-[#E8E5DD]">
            <div className="p-2.5 rounded-lg bg-[#0E1C2F] text-[#FDE68A] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                Factory Timings
              </div>
              <div className="font-bold text-[#0E1C2F] text-xs sm:text-sm mt-0.5">
                Mon – Sat: 8:00 AM – 7:30 PM
              </div>
              <div className="text-[11px] text-[#475467]">Sunday: 9:00 AM – 2:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product & Manufacturing Solutions Grid */}
      <section id="products" className="max-w-6xl mx-auto px-4 space-y-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#DCD7CD] pb-4 gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold">
              Factory Manufacturing Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E1C2F] font-serif">
              Our Fencing Products &amp; Services
            </h2>
          </div>
          <span className="text-xs text-[#667085]">
            Engineered for high tensile strength, anti-sagging, and extended outdoor lifespan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productOfferings.map((prod) => {
            const Icon = prod.icon;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#E2E6EA] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#0E1C2F] hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#DCD7CD] flex items-center justify-center text-[#0E1C2F] group-hover:bg-[#0E1C2F] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6 text-[#B45309] group-hover:text-[#FDE68A] transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md font-bold uppercase bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]">
                      {prod.highlight}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0E1C2F] group-hover:text-[#B45309] transition-colors">
                      {prod.title}
                    </h3>
                    <div className="text-xs font-semibold text-[#667085] mt-0.5">
                      {prod.specs}
                    </div>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed">
                    {prod.desc}
                  </p>

                  {/* Bullet features */}
                  <div className="space-y-1.5 pt-1">
                    {prod.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#344054]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E5DD] space-y-3">
                  <div className="text-[11px] text-[#667085]">
                    <span className="font-semibold text-[#0E1C2F]">Best for:</span> {prod.idealFor}
                  </div>

                  <a
                    href="#contact"
                    onClick={() => setFencingType(prod.id)}
                    className="w-full py-2 px-3 rounded-lg bg-[#F8F9FA] hover:bg-[#0E1C2F] hover:text-white border border-[#DCD7CD] text-xs font-bold text-[#0E1C2F] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Request Rates for this Item</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Specifications Matrix */}
      <section id="specifications" className="max-w-6xl mx-auto px-4 space-y-6 scroll-mt-20">
        <div className="border-b border-[#DCD7CD] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold">
            Standard Manufacturing Parameters
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E1C2F] font-serif">
            Chain Link &amp; Wire Technical Specifications
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Choose the ideal gauge and mesh dimensions to match your exact site security requirements.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCD7CD] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-[#0E1C2F] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold">Wire Gauge (SWG)</th>
                  <th className="py-3 px-4 font-bold">Standard Mesh Sizes</th>
                  <th className="py-3 px-4 font-bold">Zinc Galvanisation</th>
                  <th className="py-3 px-4 font-bold">Tensile Strength</th>
                  <th className="py-3 px-4 font-bold">Primary Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {specMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0E1C2F] font-mono">{row.gauge}</td>
                    <td className="py-3.5 px-4 text-[#344054] font-medium">{row.meshSizes}</td>
                    <td className="py-3.5 px-4 text-[#B45309] font-semibold">{row.coating}</td>
                    <td className="py-3.5 px-4 text-[#475467] font-mono">{row.tensile}</td>
                    <td className="py-3.5 px-4 text-[#344054]">{row.application}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-[#FBF9F5] border-t border-[#E8E5DD] text-[11px] text-[#667085] flex flex-wrap items-center justify-between gap-2">
            <span>* Custom gauge combinations and PVC coating colors (Dark Green, Blue) available on bulk orders.</span>
            <span className="font-mono text-[#B45309] font-bold">Tolerances comply with IS 2721 &amp; IS 280 standards</span>
          </div>
        </div>
      </section>

      {/* Why Choose Umesh Fencing Works */}
      <section id="about" className="max-w-6xl mx-auto px-4 space-y-6 scroll-mt-20">
        <div className="border-b border-[#DCD7CD] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold">
            The Umesh Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0E1C2F] font-serif">
            Why Hundreds of Landowners &amp; Builders Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0E1C2F] text-sm">Guaranteed Weight &amp; Length</h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              We strictly maintain true wire gauge and declared roll lengths with zero gauge under-sizing or tampering.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0E1C2F] text-sm">Direct Factory Manufacturing</h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Everything is manufactured in-house at Bukkarayasamudram. By cutting out retail middlemen, you save up to 25%.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0E1C2F] text-sm">Massive Ready Stock</h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Standard heights (4ft, 5ft, 6ft, 7ft, 8ft) are always kept ready in warehouse for immediate same-day truck loading.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E6EA] p-5 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0E1C2F] text-sm">Expert Turnkey Erection</h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              We provide experienced fencing installation technicians with post pit augers and heavy mechanical wire tensioners.
            </p>
          </div>
        </div>
      </section>

      {/* Applications & Sectors Served */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#0E1C2F] text-white rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#FDE68A] font-bold">
              Sectors &amp; Industries Served
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif mt-1">
              Trusted Across Diverse Boundary Requirements
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">🌾</div>
              <div className="text-xs font-bold text-white">Farms &amp; Orchards</div>
              <div className="text-[10px] text-slate-300">Mango, Groundnut &amp; Paddy</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">☀️</div>
              <div className="text-xs font-bold text-white">Solar Power Parks</div>
              <div className="text-[10px] text-slate-300">High-Security Perimeters</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">🏭</div>
              <div className="text-xs font-bold text-white">Industrial Plots</div>
              <div className="text-[10px] text-slate-300">Warehouses &amp; Factories</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">🛣️</div>
              <div className="text-xs font-bold text-white">Highway Infra</div>
              <div className="text-[10px] text-slate-300">Median &amp; Right-of-Way</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">🏡</div>
              <div className="text-xs font-bold text-white">Gated Layouts</div>
              <div className="text-[10px] text-slate-300">Residential Real Estate</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="text-2xl">🐄</div>
              <div className="text-xs font-bold text-white">Dairy &amp; Poultry</div>
              <div className="text-[10px] text-slate-300">Livestock Enclosures</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quotation Calculator & Direct Factory Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-4 scroll-mt-20">
        <div className="bg-white rounded-2xl border-2 border-[#0E1C2F] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Quick Quotation Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-xs font-bold mb-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>Instant Factory Estimate Request</span>
              </div>
              <h2 className="text-2xl font-black text-[#0E1C2F] font-serif">
                Request a Free Price Quotation
              </h2>
              <p className="text-xs text-[#667085] mt-1">
                Tell us your fencing requirements and we will send you factory-direct pricing immediately via WhatsApp or phone.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0E1C2F] mb-1">
                    Select Product / Fencing Type *
                  </label>
                  <select
                    value={fencingType}
                    onChange={(e) => setFencingType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD7CD] bg-[#FBF9F5] focus:outline-none focus:border-[#0E1C2F] font-semibold text-[#0E1C2F]"
                  >
                    <option value="chainlink">GI Chain Link Wire Mesh</option>
                    <option value="barbed-wire">High-Tensile Barbed Wire</option>
                    <option value="poles">Precast Concrete Poles (RCC)</option>
                    <option value="solar">Agricultural Solar Power Fencing</option>
                    <option value="gates">Custom GI Tubular Gates</option>
                    <option value="turnkey">Full Turnkey Supply &amp; Installation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E1C2F] mb-1">
                    Approximate Boundary Length *
                  </label>
                  <select
                    value={perimeterLength}
                    onChange={(e) => setPerimeterLength(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD7CD] bg-[#FBF9F5] focus:outline-none focus:border-[#0E1C2F] font-semibold text-[#0E1C2F]"
                  >
                    <option value="250">250 Feet (Small plot / site)</option>
                    <option value="500">500 Feet (~Half Acre)</option>
                    <option value="830">830 Feet (1 Acre perimeter)</option>
                    <option value="1200">1,200 Feet (1.5–2 Acres)</option>
                    <option value="2000">2,000+ Feet (Large farm / commercial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0E1C2F] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD7CD] bg-white focus:outline-none focus:border-[#0E1C2F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E1C2F] mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9440857111"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD7CD] bg-white focus:outline-none focus:border-[#0E1C2F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E1C2F] mb-1">
                  Plot / Farm Location (Village / Mandal / Town)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bukkarayasamudram, Dharmavaram, Anantapur"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD7CD] bg-white focus:outline-none focus:border-[#0E1C2F]"
                />
              </div>

              {inquirySent && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your inquiry has been generated! We will connect with you promptly.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-[#0E1C2F] hover:bg-[#1A3254] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FDE68A]" />
                <span>Send Quotation Request via WhatsApp</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Right: Factory Contact & Location Card */}
          <div className="lg:col-span-5 bg-[#0E1C2F] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FDE68A] font-bold">
                  Direct Contact
                </span>
                <h3 className="text-xl font-bold font-serif mt-1">
                  Visit Works or Call Factory
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Walk in to our Bukkarayasamudram manufacturing facility to inspect sample mesh weaves, wire gauges, and precast concrete posts.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-[#FDE68A] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Factory &amp; Works Address</div>
                    <div className="text-slate-300 leading-snug mt-0.5">
                      {BUSINESS_DETAILS.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-[#FDE68A] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Proprietor Phones</div>
                    <div className="mt-0.5 space-y-0.5">
                      <a
                        href="tel:+919440857111"
                        className="block text-[#FDE68A] hover:underline font-mono font-bold"
                      >
                        +91 94408 57111 (C. Umesh)
                      </a>
                      <a
                        href="tel:+919490185110"
                        className="block text-slate-300 hover:underline font-mono"
                      >
                        +91 94901 85110 (Works Support)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-[#FDE68A] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Direct Email</div>
                    <a
                      href="mailto:umeshfencingworks@gmail.com"
                      className="text-slate-300 hover:text-[#FDE68A] transition-colors"
                    >
                      umeshfencingworks@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-2">
              <div className="text-[11px] text-slate-300 font-semibold">
                Serving All Districts in Rayalaseema &amp; AP:
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Anantapur • Sri Sathya Sai • Kurnool • Nandyal • YSR Kadapa • Tirupati • Chittoor • Bellary Border
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client-Facing Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-10 border-t border-[#DCD7CD] text-xs text-[#667085] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[#182230] text-sm">
            Umesh Fencing Works • Proprietor: {BUSINESS_DETAILS.proprietor}
          </div>
          <div className="text-[11px] mt-0.5">
            Manufacturers of GI Chain Link Mesh, Barbed Wire &amp; Concrete Poles • Anantapur, AP
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs font-semibold text-[#475467]">
          <a href="#products" className="hover:text-[#0E1C2F]">
            Products
          </a>
          <a href="#specifications" className="hover:text-[#0E1C2F]">
            Specifications
          </a>
          <a href="#about" className="hover:text-[#0E1C2F]">
            Why Choose Us
          </a>
          <a href="#contact" className="hover:text-[#0E1C2F]">
            Contact Factory
          </a>

          {/* Ledger Button */}
          <button
            type="button"
            onClick={handleLedgerClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#1A3254] text-[#FDE68A] text-xs font-bold transition-all shadow-xs cursor-pointer border border-[#B45309]"
            title="Open Commercial Ledger (Authorized Google Account Required)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Ledger</span>
          </button>
        </div>
      </footer>

      {/* Google Authentication Modal for Commercial Ledger Access */}
      {showLedgerAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          {/* ACCESS DENIED POPUP MODAL (if unauthorized email attempted) */}
          {unauthorizedEmailAttempt ? (
            <div className="bg-white rounded-2xl border-2 border-red-500 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 relative">
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-500 mx-auto flex items-center justify-center text-red-600 shadow-sm">
                <Ban className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-red-950 font-serif">
                  Access Denied
                </h3>
                <p className="text-xs font-bold text-red-600">
                  You don&apos;t have access to this portal.
                </p>
                <p className="text-[11px] text-[#5A6A80] pt-0.5">
                  Signed in as: <strong className="text-[#0E1C2F] font-mono break-all">{unauthorizedEmailAttempt}</strong>
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Restricted Access</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-snug">
                  Only the proprietor account (<strong>{primaryAdminEmail || "umeshfencingworks@gmail.com"}</strong>) can access the management ledger.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    dismissUnauthorizedModal();
                    handleGoogleSignIn();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Try Authorized Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissUnauthorizedModal();
                    setShowLedgerAuthModal(false);
                  }}
                  className="py-2 px-3 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-[#0E1C2F] shadow-2xl max-w-sm w-full p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
              <button
                type="button"
                onClick={() => setShowLedgerAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#667085] hover:text-[#0E1C2F] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-full bg-[#0E1C2F] border-2 border-[#B45309] mx-auto flex items-center justify-center text-[#FDE68A] shadow-md">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0E1C2F] font-serif">
                  Commercial Ledger &amp; Admin
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Sign in with the authorized Google administrator account to access the Umesh Fencing Works commercial ledger.
                </p>
              </div>

              {/* Google Sign In Button */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#0E1C2F] border-2 border-[#DCD7CD] hover:border-[#0E1C2F] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer group"
                >
                  {/* Google Official G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSigningIn ? "Connecting to Google..." : "Sign In with Google"}</span>
                </button>

                <div className="bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl p-3 text-[11px] text-[#5A6A80] text-left space-y-1">
                  <div className="font-bold text-[#0E1C2F] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Authorized Administrator Account:</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#B45309] font-bold break-all bg-white px-2 py-1 rounded border border-[#E8E5DD]">
                    {primaryAdminEmail || "umeshfencingworks@gmail.com"}
                  </div>
                  <div className="text-[10px] text-[#667085] leading-snug">
                    Any other Google account will be blocked with an access denied alert.
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowLedgerAuthModal(false)}
                  className="w-full py-2 px-3 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
