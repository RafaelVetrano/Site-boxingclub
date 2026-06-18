// Inline SVG icon set (replaces lucide-react)
const __iconBase = (paths) => ({ size = 20, className = '', strokeWidth = 2, fill = 'none', ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} {...rest}
  >{paths}</svg>
);

const Menu          = __iconBase(<><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>);
const X             = __iconBase(<><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>);
const MapPin        = __iconBase(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>);
const Phone         = __iconBase(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>);
const Instagram     = __iconBase(<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>);
const Mail          = __iconBase(<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>);
const Clock         = __iconBase(<><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></>);
const ChevronRight  = __iconBase(<polyline points="9 6 15 12 9 18"/>);
const ChevronDown   = __iconBase(<polyline points="6 9 12 15 18 9"/>);
const ChevronLeft   = __iconBase(<polyline points="15 6 9 12 15 18"/>);
const Users         = __iconBase(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
const Flame         = __iconBase(<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>);
const Shield        = __iconBase(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>);
const Star          = __iconBase(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>);
const ShoppingBag   = __iconBase(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>);
const ShoppingCart  = __iconBase(<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>);
const ArrowRight    = __iconBase(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);
const ArrowLeft     = __iconBase(<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>);
const Check         = __iconBase(<polyline points="20 6 9 17 4 12"/>);
const Target        = __iconBase(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>);
const Trophy        = __iconBase(<><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v8a6 6 0 0 1-12 0V3z"/><path d="M9 21h6"/><path d="M12 17v4"/></>);
const Sparkles      = __iconBase(<><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5z"/><path d="M19 14l-.7 2.1L16 17l2.3.9L19 20l.7-2.1L22 17l-2.3-.9z"/></>);
const Dumbbell      = __iconBase(<><path d="M14.4 14.4 9.6 9.6"/><path d="M18.66 5.34 21 7.66"/><path d="M3 16.34 5.34 18.66"/><rect x="14.83" y="13.41" width="5.66" height="2.83" rx="0.5" transform="rotate(-45 17.66 14.83)"/><rect x="3.51" y="7.76" width="5.66" height="2.83" rx="0.5" transform="rotate(-45 6.34 9.17)"/></>);
const User          = __iconBase(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>);
const LogOut        = __iconBase(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>);
const LogIn         = __iconBase(<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>);
const Plus          = __iconBase(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>);
const Minus         = __iconBase(<line x1="5" y1="12" x2="19" y2="12"/>);
const Trash         = __iconBase(<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>);
const Edit          = __iconBase(<><path d="M17 3a2.828 2.828 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>);
const Search        = __iconBase(<><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>);
const Calendar      = __iconBase(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>);
const CreditCard    = __iconBase(<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>);
const Package       = __iconBase(<><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>);
const LayoutDashboard = __iconBase(<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>);
const Settings      = __iconBase(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);
const Lock          = __iconBase(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>);
const AlertTriangle = __iconBase(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);
const TrendingUp    = __iconBase(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>);
const Eye           = __iconBase(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>);
const Filter        = __iconBase(<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>);

const WhatsApp      = __iconBase(<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M8.5 11.5c.5 1.5 1.5 2.5 3 3" strokeWidth="1.5"/></>);
const MessageCircle = WhatsApp;

Object.assign(window, {
  IconMenu: Menu, IconX: X, IconMapPin: MapPin, IconPhone: Phone, IconInstagram: Instagram,
  IconMail: Mail, IconClock: Clock, IconChevronRight: ChevronRight, IconChevronDown: ChevronDown, IconChevronLeft: ChevronLeft,
  IconUsers: Users, IconFlame: Flame, IconShield: Shield, IconStar: Star,
  IconShoppingBag: ShoppingBag, IconShoppingCart: ShoppingCart,
  IconArrowRight: ArrowRight, IconArrowLeft: ArrowLeft, IconCheck: Check,
  IconTarget: Target, IconTrophy: Trophy, IconSparkles: Sparkles, IconDumbbell: Dumbbell,
  IconUser: User, IconLogOut: LogOut, IconLogIn: LogIn,
  IconPlus: Plus, IconMinus: Minus, IconTrash: Trash, IconEdit: Edit, IconSearch: Search,
  IconCalendar: Calendar, IconCreditCard: CreditCard, IconPackage: Package,
  IconLayoutDashboard: LayoutDashboard, IconSettings: Settings, IconLock: Lock,
  IconAlertTriangle: AlertTriangle, IconTrendingUp: TrendingUp, IconEye: Eye, IconFilter: Filter,
  IconWhatsApp: WhatsApp, IconMessageCircle: MessageCircle,
});
