import Navbar from './(landing)/components/Navbar';
import Hero from './(landing)/components/Hero';
import ProductosDestacados from './(landing)/components/ProductosDestacados';
import BannerCTA from './(landing)/components/BannerCTA';
import Colecciones from './(landing)/components/Colecciones';
import Footer from './(landing)/components/Footer';
import EditorialSection from './(landing)/components/EditorialSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProductosDestacados />
      <Colecciones />
      <EditorialSection />
      <BannerCTA />
      <Footer />
    </main>
  );
}
