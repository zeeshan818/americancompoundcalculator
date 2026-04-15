import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compound Interest Calculator | AmericanCompoundCalculator.com',
  description: 'The most transparent compound interest calculator online — AmericanCompoundCalculator.com. See exactly how your money grows with full control over compounding frequency, contribution timing, and variable rates.',
  keywords: 'compound interest calculator, investment calculator, savings calculator, retirement calculator',
  authors: [{ name: 'Dr. Zee' }],
  openGraph: {
    title: 'Compound Interest Calculator | AmericanCompoundCalculator.com',
    description: 'The most transparent compound interest calculator online — AmericanCompoundCalculator.com.',
    type: 'website',
    url: 'https://americancompoundcalculator.com',
  },
  metadataBase: new URL('https://americancompoundcalculator.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Compound Interest Calculator',
              description: 'The most transparent compound interest calculator online. See exactly how your money grows with full control over compounding frequency, contribution timing, and variable rates.',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Compound interest calculation',
                'Multiple compounding frequencies',
                'Contribution timing control',
                'Inflation adjustment',
                'Scenario comparison',
                'CSV export',
                'Year-by-year breakdown',
              ],
            }),
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
