import './LoginPage.css';
import Footer from './Footer';
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

  return (
    <div>
       <Header/>
    <div id="d1">
      <h1>Login</h1>
     

      <img id="i1" src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg" alt="Logo"/>
       <h2>FindMyDonor</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="username" required />
        <input type="password" name="password" placeholder="password" required />

        <p className="signup">not a member? <a href="#">Sign up now</a></p>

        <button type="submit">Login</button>
      </form>
       
    </div>
    <Footer/>
    </div>
  );
};

export default LoginPage;
