export function LogoWordmark({ compact = false }) {
  return (
    <img
      className={compact ? 'logo-image logo-image-compact' : 'logo-image'}
      src="/retr0.svg"
      alt="retr0 anime poll"
      loading="eager"
    />
  )
}
