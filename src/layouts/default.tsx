import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate } from "react-router"
import { Outlet } from "react-router"

const DefaultLayout: React.FC = () => {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container py-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default DefaultLayout
