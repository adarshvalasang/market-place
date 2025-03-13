"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { getOrders } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  productId: string
  productName: string
  buyerName: string
  buyerEmail: string
  shippingAddress: string
  quantity: number
  totalPrice: number
  status: string
  createdAt: string
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const placedOrders = orders.filter((order) => order.status !== "seller")
  const sellerOrders = orders.filter((order) => order.status === "seller")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      <Tabs defaultValue="placed">
        <TabsList className="mb-6">
          <TabsTrigger value="placed">Orders Placed</TabsTrigger>
          <TabsTrigger value="seller">Seller Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="placed">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : placedOrders.length > 0 ? (
            <div className="space-y-4">
              {placedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Product</h3>
                        <p>{order.productName}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                        <p className="font-medium mt-2">Total: ${order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Shipping Details</h3>
                        <p>{order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Ordered on: {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No orders placed yet</h3>
              <p className="text-muted-foreground mt-2">Browse products and place your first order</p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Browse Products</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seller">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sellerOrders.length > 0 ? (
            <div className="space-y-4">
              {sellerOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Product</h3>
                        <p>{order.productName}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                        <p className="font-medium mt-2">Total: ${order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Buyer Details</h3>
                        <p>{order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Ordered on: {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No seller orders yet</h3>
              <p className="text-muted-foreground mt-2">When customers buy your products, they'll appear here</p>
              <Link href="/products/new" className="mt-4 inline-block">
                <Button>Add New Product</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

