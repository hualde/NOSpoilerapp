import { Suspense } from 'react'
import SuccessContent from '../../components/SuccessContent'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}