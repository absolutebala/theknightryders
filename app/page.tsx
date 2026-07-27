export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>
            <span className="line1">Ride till the last mile.</span>
            <span className="line2">
              An exclusive club for <span className="highlight">Honda CB350!</span>
            </span>
          </h1>
          <a href="/about" className="btn btn-outline">
            Know about our club
          </a>
          <div className="stats">
            <div>
              <div className="stat-num">88</div>
              <div className="stat-label">Rides</div>
            </div>
            <div>
              <div className="stat-num">50,621</div>
              <div className="stat-label">Kilometers Covered</div>
            </div>
            <div>
              <div className="stat-num">169</div>
              <div className="stat-label">Riders</div>
            </div>
            <div>
              <div className="stat-num">133</div>
              <div className="stat-label">Saplings Planted</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="container about-grid">
          <div>
            <img
              src="https://www.theknightryders.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-24-at-10.53.43-AM-e1774344657594-389x400.jpeg"
              alt="Mr. Manivannan milestone celebration"
            />
          </div>
          <div>
            <span className="eyebrow-sm" style={{ textAlign: "left" }}>
              Milestone
            </span>
            <h2>
              We proudly celebrate <span>Mr. Manivannan</span>
            </h2>
            <p>
              A member of The Knight Ryders, for achieving an incredible
              milestone of <strong>3,00,000&nbsp;km</strong> on his Honda
              H&apos;ness CB350.
            </p>
            <p>
              This journey reflects true passion, consistency, and the
              spirit of long-distance riding — an inspiration to every
              rider in our community.
            </p>
          </div>
        </div>
      </section>

      <section id="ride-for-cause">
        <div className="container">
          <span className="eyebrow-sm">Say No to Drugs</span>
          <h2 className="section-title">Ride for the Cause</h2>
          <p className="section-sub">
            If you are an Organisation / Institution, we are ready to
            collaborate with you for any Social Awareness rides. WhatsApp:
            +91 6381 890 182
          </p>
          <div className="gallery-grid small">
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/08/Screenshot-2023-08-16-at-11.09.21-AM-400x232.png"
                alt="Helping the Kids"
              />
              <figcaption>Helping the Kids</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/02/WhatsApp-Image-2021-10-06-at-8.11.20-AM.jpeg"
                alt="All set for the ride"
              />
              <figcaption>All set for the ride</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/08/Screenshot-2023-08-16-at-11.13.23-AM-400x270.png"
                alt="Arranged by Honda BigWing South"
              />
              <figcaption>Arranged by Honda BigWing South</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/02/WhatsApp-Image-2021-10-02-at-6.10.49-PM-1-300x169.jpg"
                alt="Bike Rally to HIET"
              />
              <figcaption>Bike Rally to HIET</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/08/WhatsApp-Image-2023-08-12-at-6.45.09-AM-400x300.jpeg"
                alt="Cleanup drive"
              />
              <figcaption>Cleanup drive with Kun BigWing</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/08/8H5A6755-400x267.jpg"
                alt="Taking Pledge"
              />
              <figcaption>Taking Pledge – #notodrugs</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--mint)" }} id="awards">
        <div className="container">
          <span className="eyebrow-sm">Recognition</span>
          <h2 className="section-title">Awards and Recognitions</h2>
          <div className="gallery-grid small">
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2024/08/IMG-20240806-WA0008-400x225.jpg"
                alt="Recognised for 75th Ride"
              />
              <figcaption>Recognised for 75th Ride</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-23-at-09.27.25_fa4503fe-400x227.jpg"
                alt="Recognised during Pickathon"
              />
              <figcaption>Recognised during Pickathon</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/10/photo_2023-10-16_10-40-29-1-400x225.jpg"
                alt="Presented to Arya Bhavan, Ulundurpet"
              />
              <figcaption>Presented to Arya Bhavan, Ulundurpet</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/02/unnamed-2-300x225.jpg"
                alt="Recognised by Bigwing North"
              />
              <figcaption>Recognised by Bigwing North</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/02/IMG-5808-300x225.jpg"
                alt="Recognizing Manivannan for 2,00,000 KMS"
              />
              <figcaption>2,00,000 KMS milestone</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2023/02/IMG-5799-300x225.jpg"
                alt="Recognised by Kun Bigwing South"
              />
              <figcaption>Recognised by Kun Bigwing South</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="gallery">
        <div className="container">
          <span className="eyebrow-sm">75 Honda Bikes</span>
          <h2 className="section-title">Rides &amp; Destinations</h2>
          <p className="section-sub">
            Chikmagalur, Thalli, Kailasa Kona Falls, Veedur Dam, Rameshwaram,
            Mahabalipuram, Shriharikotta, Poomparai, Pondicherry &amp; more.
          </p>
          <div className="gallery-grid">
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2025/12/Picsart_25-09-16_06-03-03-160-400x185.png"
                alt="75 Honda Bikes"
              />
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-27-at-8.27.24-PM-400x300.jpeg"
                alt="Chikmagalur"
              />
              <figcaption>Chikmagalur</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-19-at-21.23.26_d77587b7-400x300.jpg"
                alt="Thalli, near Hosur"
              />
              <figcaption>Thalli, near Hosur</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/08/cropped-WhatsApp-Image-2022-08-07-at-5.58.54-PM-300x171.jpeg"
                alt="Thalli, near Hosur"
              />
              <figcaption>Thalli, near Hosur</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-18-at-8.07.42-PM-300x169.jpeg"
                alt="Thalli, near Hosur"
              />
              <figcaption>Thalli, near Hosur</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-27-at-1.51.48-PM-300x225.jpeg"
                alt="Kailasa Kona Falls"
              />
              <figcaption>Kailasa Kona Falls</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-25-at-7.52.45-PM-300x185.jpeg"
                alt="On the way to Veedur Dam"
              />
              <figcaption>On the way to Veedur Dam</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-27-at-6.51.56-PM-300x151.jpeg"
                alt="Thalli, Hosur Rathnamala Estate"
              />
              <figcaption>Thalli, Hosur Rathnamala Estate</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/04/WhatsApp-Image-2022-04-04-at-10.35.51-PM-300x200.jpeg"
                alt="Arichalmunai, Rameshwaram"
              />
              <figcaption>Arichalmunai, Rameshwaram</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/04/WhatsApp-Image-2022-04-04-at-10.35.52-PM-300x142.jpeg"
                alt="Mahaballipuram"
              />
              <figcaption>Mahaballipuram</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/04/20a-scaled-e1649126647575-300x182.jpg"
                alt="Veedur Dam"
              />
              <figcaption>Veedur Dam</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/03/theknightryders-1-300x225.jpeg"
                alt="Shriharikotta"
              />
              <figcaption>Shriharikotta</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/07/DSCF0065-300x169.jpeg"
                alt="Long Ride to Poomparai"
              />
              <figcaption>Long Ride to Poomparai</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-25-at-7.44.11-PM-1-193x300.jpeg"
                alt="Short Ride to Pondy"
              />
              <figcaption>Short Ride to Pondy</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-25-at-7.31.06-PM-172x300.jpeg"
                alt="Ride gallery"
              />
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-25-at-7.29.01-PM-165x300.jpeg"
                alt="Ride gallery"
              />
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/06/WhatsApp-Image-2022-06-25-at-7.33.32-PM-1-195x300.jpeg"
                alt="Ride gallery"
              />
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/05/WhatsApp-Image-2022-05-17-at-1.33.57-PM-300x169.jpeg"
                alt="Munnar ride"
              />
              <figcaption>Munnar ride</figcaption>
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/03/3b9a4f04-80cb-4147-82e8-f667a126b047-300x248.jpeg"
                alt="Ride gallery"
              />
            </figure>
            <figure>
              <img
                src="https://www.theknightryders.com/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-20-at-1.17.30-PM-1-300x167.jpeg"
                alt="Ride gallery"
              />
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}
