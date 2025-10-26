import React from 'react';
import IconsaxIcon from './IconsaxIcon';

type SocialIconProps = {
  name: string;
  size?: number;
  className?: string;
  color?: string;
};

const SocialIcons: React.FC<SocialIconProps> = ({ 
  name, 
  size = 24, 
  className = '',
  color = 'currentColor'
}) => {
  // Map social network names to Iconsax icon names
  const iconMap: { [key: string]: string } = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter',
    youtube: 'Youtube',
    linkedin: 'Linkedin',
    whatsapp: 'Whatsapp',
    telegram: 'Send',
    discord: 'MessageText1',
  };

  const iconName = iconMap[name.toLowerCase()];
  
  if (!iconName) {
    console.warn(`Icon '${name}' not found. Available icons: ${Object.keys(iconMap).join(', ')}`);
    return null;
  }

  return (
    <IconsaxIcon 
      name={iconName} 
      className={`${className} w-${size} h-${size}`} 
      variant="Bold"
    />
  );
};

export default SocialIcons;
