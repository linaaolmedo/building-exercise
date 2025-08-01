import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../lib/supabase'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark'
  showTagline?: boolean
  size?: 'small' | 'medium' | 'large'
  width?: number
  height?: number
}

export default function Logo({ 
  className = '', 
  variant = 'dark', 
  showTagline = false,
  size = 'medium',
  width,
  height
}: LogoProps) {
  const router = useRouter()
  const { appUser } = useAuth()
  
  // Default dimensions based on size
  const defaultDimensions = {
    small: { width: 120, height: 32 },
    medium: { width: 160, height: 42 },
    large: { width: 200, height: 52 }
  }
  
  const dimensions = {
    width: width || defaultDimensions[size].width,
    height: height || defaultDimensions[size].height
  }
  
  // Use the white version for light variant (on dark backgrounds)
  const logoSrc = variant === 'light' 
    ? '/EDUClaim_Horz_White.png'
    : '/EDUClaim_Horz_White.png'  // You can add a dark version later if needed
  
  const taglineColorClass = variant === 'light' ? 'text-white/80' : 'text-gray-600'
  
  // Function to get dashboard route based on user role
  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case 'Administrator':
        return '/administrator'
      case 'Billing Administrator':
        return '/billing-administrator'
      case 'Supervisor':
        return '/supervisor'
      case 'Practitioner':
        return '/practitioner'
      default:
        return '/'
    }
  }
  
  // Handle logo click
  const handleLogoClick = () => {
    if (appUser?.role) {
      const dashboardRoute = getDashboardRoute(appUser.role)
      router.push(dashboardRoute)
    }
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className="relative cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleLogoClick()
          }
        }}
        aria-label="Go to dashboard"
      >
        <Image
          src={logoSrc}
          alt="EDUclaim - Powered by Kern Integrated Data Systems"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
      {showTagline && (
        <div className={`text-xs ${taglineColorClass} font-medium ml-2`}>
          Powered by Kern Integrated Data Systems
        </div>
      )}
    </div>
  )
}