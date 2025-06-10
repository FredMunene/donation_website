<script>
  export let project;
</script>

<div class="card">
  <h3>{project.title}</h3>
  <p>{project.description}</p>
  <div class="progress">
    <div class="bar" style="width: {project.current_amount / project.target_amount * 100}%"></div>
  </div>
  <p>KSh {project.current_amount} / KSh {project.target_amount}</p>
  <a href="/donate/{project.id}">Donate Now</a>
</div>

<style>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    margin: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .progress {
    background: #eee;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
  }
  .bar {
    background: #4CAF50;
    height: 100%;
    transition: width 0.3s ease;
  }
  a {
    display: inline-block;
    margin-top: 8px;
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
</style> 