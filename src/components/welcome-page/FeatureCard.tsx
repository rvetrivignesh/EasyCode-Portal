import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 bg-[var(--background)] border border-[var(--secondary-text)] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--secondary-text)]">{description}</p>
    </div>
  );
};

export default FeatureCard;
