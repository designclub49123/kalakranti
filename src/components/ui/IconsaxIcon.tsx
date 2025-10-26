import React from 'react';
import * as IconsaxIcons from 'iconsax-react';

type IconsaxIconProps = {
  name: string;
  variant?: 'Bold' | 'Broken' | 'Bulk' | 'Curved' | 'Linear' | 'Outline' | 'Twotone';
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

// Map of icon names to their corresponding Iconsax components
const iconComponents: { [key: string]: React.ComponentType<any> } = {
  // Basic Icons
  'Home': IconsaxIcons.Home2,
  'Calendar': IconsaxIcons.Calendar1,
  'Calendar1': IconsaxIcons.Calendar1,
  'People': IconsaxIcons.People,
  'User': IconsaxIcons.User,
  'Award': IconsaxIcons.Award,
  'Award1': IconsaxIcons.Award,
  'Message': IconsaxIcons.Message,
  'MessageText1': IconsaxIcons.MessageText1,
  'Category': IconsaxIcons.Category2,
  'Category2': IconsaxIcons.Category2,
  'Calendar2': IconsaxIcons.Calendar2,
  'AddCircle': IconsaxIcons.AddCircle,
  'ArrowRight2': IconsaxIcons.ArrowRight2,
  'ArrowLeft2': IconsaxIcons.ArrowLeft2,
  'ArrowDown2': IconsaxIcons.ArrowDown2,
  'Star': IconsaxIcons.Star1,
  'Star1': IconsaxIcons.Star1,
  'Location': IconsaxIcons.Location,
  'LocationTick': IconsaxIcons.LocationTick,
  'Call': IconsaxIcons.Call,
  'Call1': IconsaxIcons.Call,
  'Ticket': IconsaxIcons.Ticket2,
  'Ticket2': IconsaxIcons.Ticket2,
  'Profile2User': IconsaxIcons.Profile2User,
  'Sms': IconsaxIcons.Sms,
  'Setting': IconsaxIcons.Setting2,
  'DocumentText': IconsaxIcons.DocumentText,
  'Logout': IconsaxIcons.Logout,
  'Shop': IconsaxIcons.Shop,
  'Gallery': IconsaxIcons.Gallery,
  'Flash': IconsaxIcons.Flash,
  'Flash1': IconsaxIcons.Flash,
  'TickCircle': IconsaxIcons.TickCircle,
  'TickCircle1': IconsaxIcons.TickCircle,
  // Social Media Icons - using available Iconsax icons
  'Instagram': IconsaxIcons.Instagram,
  'Facebook': IconsaxIcons.Facebook,
  'Twitter': IconsaxIcons.Twitter,  // Using Twitter icon
  'Youtube': IconsaxIcons.Youtube,
  'Linkedin': IconsaxIcons.Linkedin, // Using Linkedin icon
  'Whatsapp': IconsaxIcons.Whatsapp,
  'Telegram': IconsaxIcons.Send2,    // Using Send2 as an alternative to Telegram
  'Discord': IconsaxIcons.Message2,  // Using Message2 as an alternative to Discord
};

const IconsaxIcon: React.FC<IconsaxIconProps> = ({
  name,
  variant = 'Linear',
  size = 24,
  color = 'currentColor',
  className = '',
  style = {},
  ...props
}) => {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    console.warn(`Icon '${name}' not found in IconsaxIcons`);
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          width: size,
          height: size,
          color,
          ...style
        }}
        {...props}
      >
        {name}
      </div>
    );
  }

  // Map variant to the correct Iconsax variant prop
  const variantProp = variant === 'Linear' ? 'variant' : `variant${variant}`;
  
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={style}
      {...{ [variantProp]: true }}
      {...props}
    />
  );
};

export default IconsaxIcon;
