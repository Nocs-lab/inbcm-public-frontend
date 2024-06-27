import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate } from "react-router"

import "uno.css"
import "@unocss/reset/tailwind.css"
import "@govbr-ds/core/dist/core.css"
import "@fortawesome/fontawesome-free/css/all.css"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Header />
      <main className="container py-20 min-h-150">{children}</main>
      <Footer />
    </>
  )
}

export default DefaultLayout
