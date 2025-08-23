// components/sections/FeaturesSection.tsx
import React from "react";
import FeatureCard from "./FeatureCard";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: "📚",
      title: "Common Workspace",
      description: "Work seamlessly with different programming languages in one place",
    },
    {
      icon: "👨‍🏫",
      title: "Expert Guidance",
      description: "Staff can easily track and review student submissions in real time",
    },
    {
      icon: "🚀",
      title: "Interactive Assignments",
      description: "Engage students with tailored assignments and interactive challenges",
    },
  ];

  return (
    <div className="mb-12">
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {features.map((f, idx) => (
          <FeatureCard
            key={idx}
            icon={f.icon}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
