import './LoginPage.css';
import Footer from './footer';
import Header from './Header';
const LoginPage = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    alert(data.message);
  };
  const floatingPlatelets = Array.from({ length: 20 }).map((_, index) => {
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 5}s`;
    const animationDuration = `${5 + Math.random() * 10}s`;

    return (
      <img
        key={index}
        className="platelet"
        src="https://thumbs.dreamstime.com/b/red-blood-cell-isolated-black-background-red-blood-cell-isolated-black-background-d-illustration-355583087.jpg"
        alt="Platelet"
        style={{
          top,
          left,
          animationDelay,
          animationDuration,
          position: 'absolute',
        }}
      />
    );
  });

  return (
    <div className="login-wrapper">
      <Header/>
      <div className="background-animation">
        {floatingPlatelets}
      </div>

      <div id="d1">
        <h1>Login</h1>
        <img
          id="i1"
          src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg"
          alt="Logo"
        />
        <h2>FindMyDonor</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="username" required />
          <input type="password" name="password" placeholder="password" required />
          <p className="signup">
            not a member? <a href="#">Sign up now</a>
          </p>
          <button type="submit">Login</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
