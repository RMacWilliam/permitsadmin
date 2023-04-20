"use client"

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';

import Link from 'next/link'
import { useRouter } from 'next/navigation';

// export const metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app',
// }

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const appContext = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!appContext.data.isAuthenticated) {
      router.push('/');
    }
  }, [appContext.data.isAuthenticated])

  if (!appContext.data.isAuthenticated) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
      </head>

      <body className="d-flex flex-column h-100 body-background-color">
        <header>
          <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark text-white">
            <div className="container-fluid">
              <div className="d-flex justify-content-between align-items-stretch w-100">
                <div className="d-flex align-items-center">
                  <a className="navbar-brand" href="#">
                    <img src="./ofsc.png" alt="Logo" width="60" height="60" />
                  </a>

                  <div className="d-flex flex-column justify-content-between">
                    <h4>Ontario Federation of Snowmobile Clubs</h4>

                    <div className="d-none d-sm-none d-md-block">
                      Logged in as {appContext.data.email}.

                      <span className="ms-2">
                        <Link className="text-decoration-none" href="" onClick={e => doLogout()}>Logout</Link>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="text-nowrap px-3 px-sm-3 px-md-0">
                    <i className="fa-solid fa-cart-shopping fa-xl"></i>
                    {appContext.data.cartItems > 0 && <span className="badge text-bg-danger rounded-pill align-text-bottom ms-1">
                      {appContext.data.cartItems}
                    </span>
                    }
                  </div>

                  <div className="d-block d-sm-block d-md-none">
                    <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                      <span className="navbar-toggler-icon"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="collapse navbar-collapse" id="navbarCollapse">
                <ul className="navbar-nav me-auto mb-2 mb-md-0 d-block d-sm-block d-md-none">
                  <li className="nav-item">
                    <Link className="nav-link" aria-current="page" href="/home">
                      <i className="fa-solid fa-house me-2"></i>
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" aria-current="page" href="/contact">
                      <i className="fa-regular fa-address-card me-2"></i>
                      Contact Information
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" aria-current="page" href="/permits">
                      <i className="fa-solid fa-snowflake me-2"></i>
                      Snowmobiles &amp; Permits
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" aria-current="page" href="/gift-cards">
                      <i className="fa-solid fa-gift me-2"></i>
                      Gift Cards
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-2" style={{ backgroundColor: 'white', height: 1 }} />
                  </li>
                  <li className="nav-item">
                    <i className="fa-solid fa-user me-2"></i>
                    Logged in as {appContext.data.email}.
                    <span className="ms-2">
                      <Link className="text-decoration-none" href="" onClick={e => doLogout()}>Logout</Link>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="nav-scroller bg-body shadow-sm d-none d-sm-none d-md-block">
            <nav className="nav" aria-label="Secondary navigation">
              <Link className={`nav-link ${appContext.data.navbarPage === 'home' ? 'active' : ''}`} href="/home">
                <i className="fa-solid fa-house me-2"></i>
                Home
              </Link>
              <Link className={`nav-link ${appContext.data.navbarPage === 'contact' ? 'active' : ''}`} href="/contact">
                <i className="fa-regular fa-address-card me-2"></i>
                Contact Information
              </Link>
              <Link className={`nav-link ${appContext.data.navbarPage === 'permits' ? 'active' : ''}`} href="/permits">
                <i className="fa-solid fa-snowflake me-2"></i>
                Snowmobiles &amp; Permits
              </Link>
              <Link className={`nav-link ${appContext.data.navbarPage === 'gift-cards' ? 'active' : ''}`} href="/gift-cards">
                <i className="fa-solid fa-gift me-2"></i>
                Gift Cards
              </Link>
            </nav>
          </div>
        </header>

        <main className="container-fluid container-md py-2">
          {children}
        </main>

        <footer className="footer bg-secondary py-3">
          <div className="container-fluid" style={{ padding: 0 }}>
            <div className="text-white text-center">Need help? Contact OFSC at 705-739-7669 or permits@ofsc.on.ca</div>
          </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossOrigin="anonymous" async></script>
      </body>
    </html>
  )

  function doLogout() {
    appContext.updater(draft => {
      draft.isAuthenticated = false;
      draft.email = undefined;
      draft.token = undefined;
    });

    router.push('/');
  }
}
