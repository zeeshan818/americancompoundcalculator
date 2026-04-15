import Calculator from '@/components/Calculator'

export default function Home() {
  return (
    <main>
      <Calculator />

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t border-gray-200 dark:border-gray-800 mt-8">
        <p>Results are estimates for educational purposes only. Not financial advice.</p>
        <p className="mt-1">© 2026 AmericanCompoundCalculator.com — Free, transparent, accurate.</p>
      </footer>
    </main>
  )
}
