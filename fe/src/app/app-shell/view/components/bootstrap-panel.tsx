export type BootstrapPanelProps = {
  heading: string
  text: string
}

export const BootstrapPanel = ({ heading, text }: BootstrapPanelProps) => {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1.5rem'
      }}
    >
      <section
        style={{
          maxWidth: '42rem',
          width: '100%',
          border: '1px solid currentColor',
          borderRadius: '0.75rem',
          padding: '1.25rem'
        }}
      >
        <h1>{heading}</h1>
        <p>{text}</p>
      </section>
    </main>
  )
}
