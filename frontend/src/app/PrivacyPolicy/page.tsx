"use client";

import { useState } from "react";
import {
  ChevronDown,
  Database,
  Eye,
  Zap,
  Lock,
  Share2,
  Shield,
} from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
}

export default function PrivacyPolicy() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["what-we-collect"]),
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections: PolicySection[] = [
    {
      id: "what-we-collect",
      title: "What We Collect",
      icon: <Database size={24} />,
      content: [
        "Journal entries you write",
        "Mood selections you make",
        "Email and account info",
        "Basic usage data (how often you use the app)",
      ],
    },
    {
      id: "how-we-use-it",
      title: "How We Use It",
      icon: <Eye size={24} />,
      content: [
        "To store and show your journal entries",
        "To detect moods from your writing using AI",
        "To generate personalized advice based on your mood",
        "To improve the app",
      ],
    },
    {
      id: "ai-processing",
      title: "AI Processing",
      icon: <Zap size={24} />,
      content: [
        "Your journal entries are analyzed by our AI to detect emotions and generate suggestions.",
        "We don't sell this data or use it to train models on other people's data.",
      ],
    },
    {
      id: "security",
      title: "Security",
      icon: <Lock size={24} />,
      content: [
        "We encrypt your data when it travels to our servers and when it's stored.",
        "Your password is encrypted.",
      ],
    },
    {
      id: "sharing-data",
      title: "Sharing Data",
      icon: <Share2 size={24} />,
      content: [
        "We don't share your personal data with anyone.",
        "We use hosting providers (like AWS) who help us run the service but can't see your entries.",
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <Shield size={24} />,
      content: [
        "Download your data",
        "Delete your account and all entries anytime",
        "Turn off AI features",
      ],
    },
  ];

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#fafafa" }}
    >
      {/* HEADER */}
      <div
        className="relative z-0 w-full py-16 md:py-24"
        style={{
          background: "linear-gradient(135deg, #f782a9 0%, #F9C5C7 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl font-bold mb-4 text-white"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "2px 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              Privacy Policy
            </h1>
            <p
              className="text-lg md:text-xl text-white opacity-95"
              style={{
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Protecting your data is our commitment. Last updated: September
              2026
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative px-4 md:px-8 lg:px-16 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div
            className="mb-12 p-8 rounded-2xl"
            style={{
              backgroundColor: "#FFF",
              border: "2px solid #F9C5C7",
              boxShadow: "0 8px 32px rgba(247, 130, 169, 0.1)",
            }}
          >
            <p
              className="text-lg leading-relaxed"
              style={{
                color: "#1a1a1a",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              This Privacy Policy outlines how we collect, use, and protect your
              personal information. We are committed to maintaining the highest
              standards of data privacy and security. By using our service, you
              agree to the practices described in this policy.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-4 mb-12">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: "#FFF",
                  border: "2px solid #F9C5C7",
                  boxShadow: expandedSections.has(section.id)
                    ? "0 12px 40px rgba(247, 130, 169, 0.15)"
                    : "0 4px 16px rgba(0, 0, 0, 0.05)",
                }}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{
                    backgroundColor: expandedSections.has(section.id)
                      ? "#fff5f8"
                      : "#FFF",
                  }}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div style={{ color: "#f782a9", display: "flex" }}>
                      {section.icon}
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1a1a1a",
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ChevronDown
                    size={24}
                    color="#f782a9"
                    className={`transition-transform duration-300 ${
                      expandedSections.has(section.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedSections.has(section.id)
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    {section.content.length === 1 ? (
                      <p
                        className="leading-relaxed"
                        style={{
                          color: "#666",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "15px",
                          lineHeight: "1.6",
                        }}
                      >
                        {section.content[0]}
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex gap-3 items-start"
                          >
                            <span
                              className="text-sm font-bold mt-0.5"
                              style={{ color: "#f782a9" }}
                            >
                              •
                            </span>
                            <span
                              style={{
                                color: "#666",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "15px",
                                lineHeight: "1.6",
                              }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div
            className="p-8 rounded-2xl mb-8"
            style={{
              backgroundColor: "#fff5f8",
              border: "2px solid #f782a9",
              boxShadow: "0 8px 32px rgba(247, 130, 169, 0.1)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1a1a1a",
              }}
            >
              Contact & Support
            </h2>
            <p
              className="mb-4"
              style={{
                color: "#666",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              If you have questions regarding this privacy policy or our data
              practices, please contact us. We are committed to addressing your
              concerns promptly.
            </p>
            <a
              href="mailto:privacy@journalapp.com"
              className="inline-block px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "#f782a9",
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(247, 130, 169, 0.35)",
              }}
            >
              Contact us
            </a>
          </div>

          {/* Footer Note */}
          <div
            className="text-center py-6"
            style={{
              color: "#999",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
            }}
          >
            <p>
              This Privacy Policy was last updated in September 2026. We reserve
              the right to modify this policy at any time. Changes will be
              effective immediately upon posting, with the updated date
              reflected above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
