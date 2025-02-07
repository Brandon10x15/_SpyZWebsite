// commands.js
function createDetails(summary, content) {
    const details = document.createElement('details');
    const summaryEl = document.createElement('summary');
    summaryEl.textContent = summary;
    details.appendChild(summaryEl);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'details-content';
    contentDiv.innerHTML = content;
    details.appendChild(contentDiv);
    
    return details;
}
function createSearchBar() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.id = 'commandSearch'; // Add ID
    searchInput.name = 'commandSearch'; // Add name
    searchInput.placeholder = 'Search commands or tags...';
    searchInput.setAttribute('title', 'Press Ctrl+K to focus search');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.command-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            const tags = Array.from(item.querySelectorAll('.tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            const matches = text.includes(searchTerm) || 
                           tags.some(tag => tag.includes(searchTerm));
            
            item.style.display = matches ? 'block' : 'none';
        });
    });
    
    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
    
    searchContainer.appendChild(searchInput);
    return searchContainer;
}

function createCommandSection(command) {
    const section = document.createElement('div');
    section.className = 'command-section';
    
    let content = `
        <div class="command-group">
            <div class="command-header">
                <h3>${command.name}</h3>
                <p><strong>Command:</strong> <code>${command.command}</code></p>
                <p><strong>Description:</strong> ${command.description}</p>
            </div>
    `;

    // Add tags
    if (command.tags && command.tags.length > 0) {
        content += `
            <div class="tags-container">
                ${command.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
    }

    // Add categories in collapsible sections
    if (command.categories) {
        content += `<div class="categories-container">`;
        Object.entries(command.categories).forEach(([category, items]) => {
            content += `
                <details class="category-details">
                    <summary class="category-summary">${category}</summary>
                    <div class="category-content">
                        <ul>
                            ${items.map(item => {
                                const [key, value] = Object.entries(item)[0];
                                return `<li><strong>${key}:</strong> ${value}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </details>
            `;
        });
        content += `</div>`;
    }

    // Add tutorial in a collapsible section
    if (command.tutorial) {
        content += `
            <details class="tutorial-details">
                <summary class="tutorial-summary">Tutorial</summary>
                <div class="tutorial-content">
                    <div class="tutorial-steps">
                        ${command.tutorial.steps.map((step, index) => `
                            <div class="tutorial-step">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-content">${step}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${command.tutorial.notes ? `
                        <div class="tutorial-notes">
                            <strong>Note:</strong> ${command.tutorial.notes}
                        </div>
                    ` : ''}
                </div>
            </details>
        `;
    }

    content += '</div>';
    section.innerHTML = content;

    // Add click handlers for details elements
    section.querySelectorAll('details').forEach(details => {
        details.addEventListener('click', (e) => {
            // Prevent click from bubbling up to parent details elements
            e.stopPropagation();
        });
    });

    return section;
}

function showCommandDetails(command) {
    const detailsContainer = document.querySelector('.command-details');
    const content = createCommandSection(command);
    detailsContainer.innerHTML = '';
    detailsContainer.appendChild(content);
}

export async function initializeCommands() {
    try {
        const container = document.getElementById('mainContainer');
        container.innerHTML = '<div class="loading">Loading commands...</div>';

        const response = await fetch('/config/commands.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        container.innerHTML = '';
        
        // Create split container
        const splitContainer = document.createElement('div');
        splitContainer.className = 'split-container';
        
        // Add search bar above split container
        container.appendChild(createSearchBar());
        
        // Create command list and details sections
        const commandsList = document.createElement('div');
        commandsList.className = 'command-list';
        
        const commandDetails = document.createElement('div');
        commandDetails.className = 'command-details';
        commandDetails.innerHTML = '<div class="select-command">Select a command to view details</div>';
        
        splitContainer.appendChild(commandsList);
        splitContainer.appendChild(commandDetails);
        container.appendChild(splitContainer);
        
        // Render commands list with collapsible role sections
        Object.entries(data.roles).forEach(([roleKey, roleData]) => {
            const roleSection = document.createElement('div');
            roleSection.className = 'role-section';
            roleSection.innerHTML = `
                <details class="role-details">
                    <summary class="role-summary">${roleData.name} Commands</summary>
                    <div class="role-content">
                        <div class="role-requirement">
                            <p>📝 These commands require the <code>${roleData.name}</code> role to execute.</p>
                        </div>
                        <div class="role-commands"></div>
                    </div>
                </details>
            `;
            
            const roleCommands = roleSection.querySelector('.role-commands');
            commandsList.appendChild(roleSection);

            roleData.commands.forEach(command => {
                const item = document.createElement('div');
                item.className = 'command-item';
                item.innerHTML = `
                    <div class="command-name">${command.name}</div>
                    <div class="command-description">${command.description}</div>
                `;
                
                item.addEventListener('click', () => {
                    document.querySelectorAll('.command-item').forEach(i => 
                        i.classList.remove('active'));
                    item.classList.add('active');
                    showCommandDetails(command);
                });
                
                roleCommands.appendChild(item);
            });
        });

    } catch (error) {
        console.error('Error loading commands:', error);
        document.getElementById('mainContainer').innerHTML = `
            <div class="error-message">
                <p><strong>Error:</strong> Failed to load commands data.</p>
                <p>Details: ${error.message}</p>
            </div>
        `;
    }
}
