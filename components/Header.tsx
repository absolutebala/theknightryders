export default function Header() {
  return (
    <header>
      <div className="nav-wrap">
        <a href="/" className="brand">
          <img
            src="https://www.theknightryders.com/wp-content/uploads/2022/03/TKR-Logo-White-1.png"
            alt="The Knight Ryders logo"
          />
          The Knight Ryders
        </a>
        <nav>
          <ul>
            <li className="current">
              <a href="/">Home</a>
            </li>
            <li className="has-dropdown">
              <a href="/rides/past">Rides</a>
              <div className="dropdown">
                <a href="/rides/past">Past Rides</a>
                <a href="/rides/upcoming">Upcoming Rides</a>
                <a href="/blog">Riders Blog</a>
                <a href="/safety">Safety</a>
                <a href="/videos">Videos</a>
                <a href="/user-photos">User Photos</a>
                <a href="/media">Media Coverage</a>
              </div>
            </li>
            <li>
              <a href="/newsletter">Newsletter</a>
            </li>
            <li>
              <a href="/csr">CSR</a>
            </li>
            <li className="has-dropdown">
              <a href="/members">Members</a>
              <div className="dropdown">
                <a href="/members">Members</a>
                <a href="/riders">Riders</a>
              </div>
            </li>
          </ul>
        </nav>
        <div className="nav-cta">
          <a href="/login">Login</a>
        </div>
        <button className="menu-toggle" aria-label="Menu">
          &#9776;
        </button>
      </div>
    </header>
  );
}
