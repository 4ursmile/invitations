        // Add click ripple effect
        function createRipple(event) {
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.className = 'click-ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        // Add ripple effect to all clickable elements
        document.querySelectorAll('.btn, .datetime, .address, .graduation-icon').forEach(el => {
            el.addEventListener('click', () => {
                createRipple(event);
                createShapeExplosion(el);
            }   );
        });

        // 3D Shapes Interaction
        function setup3DShapes() {
            const shapes = document.querySelectorAll('.floating-shapes .shape');
            
            shapes.forEach((shape, index) => {
                // Add click event for 3D shapes
                shape.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Create explosion effect
                    this.style.animation = 'none';
                    this.style.transform = 'scale(1.5) rotateY(720deg) rotateX(360deg)';
                    
                    // Create particle explosion
                    createShapeExplosion(this);
                    
                    // Reset after animation
                    setTimeout(() => {
                        this.style.animation = `float${(index % 6) + 1} ${8 + index}s ease-in-out infinite`;
                        this.style.transform = '';
                    }, 1000);
                });
                
                // Add double-click for teleport effect
                shape.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    teleportShape(this);
                });
                
                // Enhanced mouse events
                shape.addEventListener('mouseenter', function() {
                    this.style.filter = 'brightness(1.4) drop-shadow(0 0 25px rgba(255, 105, 180, 0.8))';
                    this.style.zIndex = '10';
                });
                
                shape.addEventListener('mouseleave', function() {
                    this.style.filter = '';
                    this.style.zIndex = '';
                });
            });
        }

        // Create shape explosion effect
        function createShapeExplosion(shape) {
            const rect = shape.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: linear-gradient(45deg, #ff69b4, #ffc3a0);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    left: ${centerX}px;
                    top: ${centerY}px;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (i / 15) * Math.PI * 2;
                const velocity = 100 + Math.random() * 100;
                const gravity = 0.5;
                
                let x = 0, y = 0, vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
                
                const animate = () => {
                    x += vx * 0.016;
                    y += vy * 0.016;
                    vy += gravity;
                    
                    particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - (y + Math.abs(x)) * 0.01})`;
                    particle.style.opacity = Math.max(0, 1 - (y + Math.abs(x)) * 0.01);
                    
                    if (particle.style.opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                
                requestAnimationFrame(animate);
            }
        }

        // Teleport shape to random position
        function teleportShape(shape) {
            const fadeOut = [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0) rotateY(180deg)' }
            ];
            
            const fadeIn = [
                { opacity: 0, transform: 'scale(0) rotateY(180deg)' },
                { opacity: 1, transform: 'scale(1) rotateY(0deg)' }
            ];
            
            shape.animate(fadeOut, { duration: 300 }).onfinish = () => {
                // Move to random position
                const newX = Math.random() * (window.innerWidth - 150);
                const newY = Math.random() * (window.innerHeight - 150);
                
                shape.style.left = newX + 'px';
                shape.style.top = newY + 'px';
                shape.style.right = 'auto';
                shape.style.bottom = 'auto';
                
                shape.animate(fadeIn, { duration: 300 });
            };
        }

        // Enhanced mouse movement parallax for 3D shapes
        document.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shapes .shape');
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            
            shapes.forEach((shape, index) => {
                const intensity = (index + 1) * 15;
                const rotateX = y * intensity * 0.5;
                const rotateY = x * intensity * 0.5;
                const translateX = x * intensity;
                const translateY = y * intensity;
                
                if (!shape.matches(':hover')) {
                    const currentTransform = shape.style.transform || '';
                    shape.style.transform = `${currentTransform} translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });
        });

        // Keyboard interactions for 3D shapes
        document.addEventListener('keydown', (e) => {
            const shapes = document.querySelectorAll('.floating-shapes .shape');
            
            switch(e.key) {
                case ' ': // Spacebar - animate all shapes
                    e.preventDefault();
                    shapes.forEach(shape => {
                        shape.style.animation = 'none';
                        shape.style.transform = 'scale(1.2) rotateY(360deg) rotateX(180deg)';
                        setTimeout(() => {
                            shape.style.animation = '';
                            shape.style.transform = '';
                        }, 1000);
                    });
                    break;
                    
                case 'r': // R key - randomize positions
                case 'R':
                    shapes.forEach(shape => teleportShape(shape));
                    break;
                    
                case 'e': // E key - explosion effect
                case 'E':
                    shapes.forEach(shape => createShapeExplosion(shape));
                    break;
            }
        });

        // Initialize 3D shapes on page load
        setup3DShapes();

        // Celebration animation for graduation icon
        function celebrateClick(element) {
            element.style.animation = 'none';
            element.classList.add('pulse');
            
            // Create confetti effect
            for (let i = 0; i < 10; i++) {
                createConfetti();
            }
            
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 2000);
        }

        function createConfetti() {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            
            document.body.appendChild(confetti);
            
            const fall = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            fall.onfinish = () => confetti.remove();
        }

        // Add to calendar functionality
        function addToCalendar() {
            const startDate = new Date('2025-06-08T08:00:00');
            const endDate = new Date('2025-06-08T10:59:59');
            
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };
            
            const title = encodeURIComponent('Graduation Ceremony - Tran Hoang Bao Ly - KHTN 2021');
            const location = encodeURIComponent('University of Information Technology - VNUHCM, Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City, Vietnam');
            const details = encodeURIComponent('Join us for our graduation celebration!');
            
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${location}&details=${details}`;
            
            window.open(googleCalendarUrl, '_blank');
            
            // Show success message
            showNotification('📅 Opening calendar...', '#ff69b4');
        }

        // Open maps functionality
        function openMaps() {
            const address = encodeURIComponent('University of Information Technology - VNUHCM, Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City, Vietnam');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
            
            window.open(mapsUrl, '_blank');
            
            showNotification('🗺️ Opening maps...', '#ff69b4');
        }

        // Save as image functionality
        function saveAsImage() {
            showNotification('📷 Preparing image...', '#ff69b4');
            
            // Create a canvas to draw the invitation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 800;
            canvas.height = 1200;
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#ff9a9e');
            gradient.addColorStop(0.5, '#fecfef');
            gradient.addColorStop(1, '#ffc3a0');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw glassmorphism card background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(100, 150, 600, 900);
            
            // Add text content
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            
            // Title
            ctx.font = 'bold 48px Georgia';
            ctx.fillText('You are invited to', 400, 250);
            
            ctx.font = 'bold 64px Georgia';
            ctx.fillText('Graduation', 400, 350);
            
            ctx.fillStyle = '#ff69b4';
            ctx.font = 'italic 48px Georgia';
            ctx.fillText('Party', 400, 420);
            
            ctx.fillStyle = '#333';
            ctx.font = 'bold 42px Georgia';
            ctx.fillText('Class of 2030', 400, 550);
            
            ctx.font = '24px Georgia';
            ctx.fillText('02 . May . at 9:00 pm', 400, 650);
            
            ctx.font = 'bold 28px Georgia';
            ctx.fillText('WARNER & SPENCER', 400, 720);
            ctx.fillText('HIGH SCHOOL', 400, 760);
            
            ctx.font = '20px Georgia';
            ctx.fillText('123 Anywhere St., Any City,', 400, 820);
            ctx.fillText('ST 12345', 400, 850);
            
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'graduation-invitation-2030.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('✅ Image saved successfully!', '#4CAF50');
            }, 'image/jpeg', 0.9);
        }

        // Show notification
        function showNotification(message, color) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${color};
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Add slide animations for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Add parallax effect to floating shapes on mouse move
        document.addEventListener('mousemove', (e) => {
            // This is now handled in the enhanced mouse movement section above
        });

        // Add loading animation on page load
        window.addEventListener('load', () => {
            const card = document.getElementById('invitationCard');
            card.style.transform = 'scale(0.8) rotateY(90deg)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.transform = 'scale(1) rotateY(0deg)';
                card.style.opacity = '1';
            }, 100);
        });
        // create interval for exploding shapes
        setInterval(() => {
            const shapes = document.querySelectorAll('.floating-shapes .shape');
            shapes.forEach(shape => {
                if (Math.random() < 0.2) { // 10% chance to explode
                    createShapeExplosion(shape);
                }
            });
        }, 2000); // Every 5 seconds
        // create interval for text
        setInterval(() => {
            var contents = [
                ".diploma",
                ".class-year",
                ".datetime",
                ".address",
                ".school-name",
            ] 
            // slect all contents and save in shapes variable
            var shapes = document.querySelectorAll(contents.join(', '));
            // loop through all shapes and add explosion effect
            shapes.forEach(shape => {
                if (Math.random() < 0.1) { // 10% chance to explode
                    createShapeExplosion(shape);
                }
            });
        }, 4000); // Every 5 seconds
        