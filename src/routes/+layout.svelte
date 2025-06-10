<script>
  // Layout logic here if needed
</script>

<header>
  <h1>Donation Platform</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/admin">Admin</a>
  </nav>
</header>

<main>
  <slot />
</main>

<footer>
  <p>&copy; 2023 Donation Platform</p>
</footer>

<style>
  header {
    background: #4CAF50;
    color: white;
    padding: 16px;
    text-align: center;
  }
  nav {
    margin-top: 8px;
  }
  nav a {
    color: white;
    margin: 0 8px;
    text-decoration: none;
  }
  main {
    padding: 16px;
  }
  footer {
    text-align: center;
    padding: 16px;
    background: #f1f1f1;
  }
</style> 