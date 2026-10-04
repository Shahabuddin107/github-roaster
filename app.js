const analyzeBtn = document.getElementById('analyzeBtn');
const usernameInput = document.getElementById('usernameInput');
const resultCard = document.getElementById('resultCard');
const loader = document.getElementById('loader');
const downloadCardBtn = document.getElementById('downloadCardBtn');
const copyRoastBtn = document.getElementById('copyRoastBtn');
const actionBtnContainer = document.getElementById('actionBtnContainer');

analyzeBtn.addEventListener('click', analyzeProfile);
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') analyzeProfile();
});

async function analyzeProfile() {
  const username = usernameInput.value.trim();
  if (!username) return alert('Username enter karo!');

  loader.style.display = 'block';
  resultCard.style.display = 'none';
  resultCard.classList.remove('shake');

  try {
    // 1. Fetch User Info
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('GitHub username nahi mila!');
    const userData = await userRes.json();

    // 2. Fetch User Repositories
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    const reposData = await reposRes.json();

    // 3. Render Profile
    displayProfileData(userData, reposData);

    // Trigger Shake Effect
    setTimeout(() => {
      resultCard.classList.add('shake');
    }, 50);

  } catch (err) {
    alert(err.message || 'Kuch error hua, check karo!');
  } finally {
    loader.style.display = 'none';
  }
}

// Zero-API Smart Dynamic Roast Engine
function generateSmartRoast(user, repos) {
  const repoCount = user.public_repos;
  const followers = user.followers;
  const repoNames = repos.map(r => r.name.toLowerCase());
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

  // Specific Repo Matchers
  if (repoNames.some(name => name.includes('portfolio') || name.includes('resume'))) {
    return `${repoCount} repos hain par portfolio par itna focus? Bhai portfolio banane se pehle do-chaar solid project commit toh kar lo, lagta hai UI sajane me hi poora semester nikal gaya!`;
  }

  if (repoNames.some(name => name.includes('iris') || name.includes('salary') || name.includes('prediction') || name.includes('house'))) {
    return `Wahi standard ML tutorials (Iris / Salary Prediction) upload kar rakhe hain! Recruiter bhi bolega: 'Bhai Kaggle ka pehla page dekhna band karo, real problem solve karo!'`;
  }

  // Language based Roast
  if (languages.includes('Python') && languages.includes('JavaScript')) {
    return `Python aur JavaScript dono me haath maara hua hai! Na script poori run hoti hai, na CSS set hoti hai. Full-stack nahi, 'jugaad-stack' developer lag rahe ho!`;
  }

  // Follower vs Repo Ratio
  if (followers === 0 && repoCount > 5) {
    return `${repoCount} repos upload karke baithe ho par 0 followers? Lagta hai undercover secret agent ho ya GitHub ko Google Drive samajh ke file backup kar rahe ho!`;
  }

  if (followers > 0 && repoCount >= 10) {
    return `${repoCount} repos aur ${followers} followers! Code theek-thaak lag raha hai, par aadhe projects tutorial dekh kar shuru kiye hain aur 'Initial commit' ke baad shanti chha gayi hai.`;
  }

  return `${repoCount} public repos! Thoda proper README documentation aur commit history regular rakho, warna lagega account sirf assignment submission ke liye khola tha.`;
}

function calculateRating(user) {
  let score = 5;
  if (user.public_repos >= 5) score += 1;
  if (user.public_repos >= 12) score += 1;
  if (user.followers >= 5) score += 1;
  if (user.bio) score += 1;
  if (user.following > 0) score += 1;
  return Math.min(score, 10);
}

function displayProfileData(user, repos) {
  document.getElementById('avatar').src = user.avatar_url;
  document.getElementById('name').textContent = user.name || user.login;
  document.getElementById('bio').textContent = user.bio || 'Bio khaali hai... mysterious coder!';
  document.getElementById('repoCount').textContent = user.public_repos;
  document.getElementById('followerCount').textContent = user.followers;
  document.getElementById('devRating').textContent = `${calculateRating(user)}/10`;

  // Set Roast
  const roast = generateSmartRoast(user, repos);
  document.getElementById('roastText').textContent = roast;

  // Render Tech Stack Badges
  const langCounts = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const techStackContainer = document.getElementById('techStack');
  techStackContainer.innerHTML = '';
  const langs = Object.keys(langCounts);

  if (langs.length === 0) {
    techStackContainer.innerHTML = `<span style="font-size: 0.75rem; color: #64748b;">No main languages detected</span>`;
  } else {
    langs.forEach(lang => {
      const badge = document.createElement('span');
      badge.style.cssText = 'background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3);';
      badge.textContent = `${lang} (${langCounts[lang]})`;
      techStackContainer.appendChild(badge);
    });
  }

  // Copy Roast Listener
  copyRoastBtn.onclick = () => {
    const textToCopy = `🔥 GitHub Roast for ${user.login} (${user.name || ''}):\n\n"${roast}"\n\n⭐ Dev Rating: ${calculateRating(user)}/10\n📦 Total Repos: ${user.public_repos}`;
    navigator.clipboard.writeText(textToCopy);
    copyRoastBtn.textContent = '✅ Copied to Clipboard!';
    setTimeout(() => { copyRoastBtn.textContent = '📋 Copy Roast to Clipboard'; }, 2000);
  };

  // Download Card as PNG Image Listener
  downloadCardBtn.onclick = () => {
    actionBtnContainer.style.display = 'none';

    html2canvas(resultCard, {
      backgroundColor: '#111827',
      scale: 2,
      useCORS: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `${user.login}-dev-roast.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      actionBtnContainer.style.display = 'flex';
    }).catch(err => {
      console.error(err);
      actionBtnContainer.style.display = 'flex';
      alert('Card download karne me dikkat aayi!');
    });
  };

  // Render Repositories
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = '';

  if (repos.length === 0) {
    repoList.innerHTML = `<li style="color:#64748b;">Koi public repo nahi mili.</li>`;
  } else {
    repos.forEach(repo => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <span style="color:#94a3b8; font-size:0.75rem;">⭐ ${repo.stargazers_count} | ${repo.language || 'Plain'}</span>
      `;
      repoList.appendChild(li);
    });
  }

  resultCard.style.display = 'block';
}