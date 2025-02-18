export const SIDEBAR_MENU = [
  {
    name: "Home",
    path: "/home",
    icon: "sidebar/home",
  },
  {
    name: "Tiksender Tutorial",
    path: "/tutorial",
    icon: "sidebar/tutorial",
  },
  {
    name: "App Configuration",
    path: "/tiksender-config",
    icon: "sidebar/tiksender-config",
    children: [
      {
        name: "Chat & Save Creators",
        path: "/tiksender-config/chat-and-save-creator",
        icon: "sidebar/tiksender-config/chat-and-save-creator",
        iconSize: 20,
      },
      {
        name: "Targeted Collaboration",
        path: "/tiksender-config/targeted-collaboration",
        icon: "sidebar/tiksender-config/targeted-collaboration",
        iconSize: 20,
      },
      {
        name: "Reply Reviews",
        path: "/tiksender-config/reply-reviews",
        icon: "sidebar/tiksender-config/reply-reviews-config",
        iconSize: 20,
      },
    ],
  },
  {
    name: "Database Creators",
    path: "/database-creator",
    icon: "sidebar/database-creator",
  },
  {
    name: "Saved Creators",
    path: "/saved-creator",
    icon: "sidebar/saved-creator",
  },
  {
    name: "Wishlist",
    path: "/wishlist",
    icon: "sidebar/wishlist",
  },
  {
    name: "Template",
    path: "/template",
    icon: "sidebar/template",
    children: [
      {
        name: "WhatsApp",
        path: "/template/whatsapp",
        icon: "sidebar/template/whatsapp",
      },
      {
        name: "Email",
        path: "/template/email",
        icon: "sidebar/template/email",
      },
    ],
  },
  {
    name: "Adds On",
    path: "/adds-on",
    icon: "sidebar/adds-on",
    children: [
      {
        name: "Buyer Info",
        path: "/adds-on/buyer-info",
        icon: "sidebar/adds-on/buyer-info",
      },
      {
        name: "Database Pembeli",
        path: "/adds-on/database-buyers",
        icon: "sidebar/database-creator",
      },
    ],
  },
];
