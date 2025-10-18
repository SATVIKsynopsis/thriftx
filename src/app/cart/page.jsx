import Footer from "@/components/common/Footer"
import CartPage from "../../components/cart/cart-page"
import Header from "../../components/common/Header"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <CartPage />
      <Footer />
    </div>
  )
}
