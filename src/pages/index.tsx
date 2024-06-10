import DefaultLayout from "../layouts/default"
import useStore from "../utils/store"

const IndexPage = () => {
  const { user } = useStore()

  return (
    <DefaultLayout>
      <h1>Olá {user?.name.split(" ")[0]}!</h1>
    </DefaultLayout>
  )
}

export default IndexPage
