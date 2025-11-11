document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    setupReloadButton();
    setupSmoothScroll();
});

async function loadSkills() {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return;

    skillsList.innerHTML = '<div class="loading-text">Loading skills...</div>';

    try {
        const response = await fetch('skills.xml', {
            headers: {
                'Accept': 'application/xml',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
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

    } catch (error) {
        console.error('Error loading skills:', error);
        showError(`Failed to load skills. ${error.message || 'Please try again later.'}`);
    }
}

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

function renderSkills(skillsByCategory, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
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
    
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            bar.style.transition = 'width 1.5s ease-in-out';
        });
    }, 100);
}

function setupReloadButton() {
    const reloadBtn = document.getElementById('reloadBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            loadSkills();
        });
    }
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

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

window.loadSkills = loadSkills;