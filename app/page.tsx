import ProductList from "@/components/product-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Link href="/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <ProductList />
    </div>
  )
}

