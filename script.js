document.addEventListener('DOMContentLoaded', () => {
  loadSkills();
  setupReloadButton();
  setupSmoothScroll();
});

/**
 * Load skills from XML file
 */
async function loadSkills() {
  const skillsList = document.getElementById('skillsList');
  if (!skillsList) return;

  // Show loading state
  skillsList.innerHTML = '<div class="loading-text">Loading skills...</div>';

  try {
    // Use XMLHttpRequest for better compatibility with local file access
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'skills.xml', true);
    
    xhr.onload = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const xmlText = xhr.responseText;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            throw new Error('Error parsing XML file');
          }
          
          const skillNodes = xmlDoc.querySelectorAll('skill');
          
          if (skillNodes.length === 0) {
            throw new Error('No skills found in XML');
          }
          
          const skillsByCategory = groupSkillsByCategory(skillNodes);
          renderSkills(skillsByCategory, skillsList);
          
        } else {
          throw new Error(`Failed to load skills: ${xhr.statusText}`);
        }
      }
    };
    
    xhr.onerror = function() {
      throw new Error('Network error while loading skills');
    };
    
    xhr.send();
    
  } catch (error) {
    console.error('Error loading skills:', error);
    showError(`Failed to load skills. ${error.message || 'Please check the console for details.'}`);
  }
}

/**
 * Group skills by their category
 */
function groupSkillsByCategory(skillNodes) {
  const categories = {};
  
  skillNodes.forEach(skill => {
    const category = skill.getAttribute('category') || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push({
      name: skill.getAttribute('name') || 'Unnamed Skill',
      level: parseInt(skill.getAttribute('level') || '50', 10),
      description: skill.textContent.trim()
    });
  });
  
  return categories;
}

/**
 * Render skills to the DOM
 */
function renderSkills(skillsByCategory, container) {
  if (!container) return;
  
  // Clear loading/error state
  container.innerHTML = '';
  
  // Create a category section for each skill category
  Object.entries(skillsByCategory).forEach(([category, skills], index) => {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'skill-category fade-in';
    categoryEl.style.animationDelay = `${index * 0.1}s`;
    
    let skillsHTML = `
      <h3>${category}</h3>
      <div class="skills-list">
    `;
    
    skills.forEach(skill => {
      skillsHTML += `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-level">${skill.level}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${skill.level}%;"></div>
          </div>
          ${skill.description ? `<p class="skill-description">${skill.description}</p>` : ''}
        </div>
      `;
    });
    
    skillsHTML += '</div>';
    categoryEl.innerHTML = skillsHTML;
    container.appendChild(categoryEl);
  });
  
  // Animate progress bars after a short delay
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(bar => {
      bar.style.transition = 'width 1.5s ease-in-out';
    });
  }, 100);
}

/**
 * Set up the reload button
 */
function setupReloadButton() {
  const reloadBtn = document.getElementById('reloadBtn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      loadSkills();
    });
  }
}

/**
 * Set up smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Show error message
 */
function showError(message) {
  const skillsList = document.getElementById('skillsList');
  if (skillsList) {
    skillsList.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button onclick="loadSkills()" class="btn" style="margin-top: 1rem;">Try Again</button>
      </div>`;
  }
}

// Make loadSkills available globally for the retry button
window.loadSkills = loadSkills;
