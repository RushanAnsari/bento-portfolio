/* =========================================================
   GITHUB PORTFOLIO CONFIGURATION
   Change only this username when using another GitHub account.
   ========================================================= */

const GITHUB_USERNAME = "RushanAnsari";

const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

/* =========================================================
   DOM ELEMENTS
   Cache the elements that will receive GitHub data.
   ========================================================= */

const githubRepos = document.querySelector("#github-repos");
const githubFollowers = document.querySelector("#github-followers");
const githubFollowing = document.querySelector("#github-following");

const githubCard = document.querySelector(".github-card");

/* =========================================================
   GITHUB DATA FETCHER
   Responsible only for requesting the GitHub profile data.
   ========================================================= */

async function fetchGitHubProfile() {
  try {
    // Send a GET request to GitHub's public user API.
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
    /* -----------------------------------------------------
           fetch() does not automatically reject HTTP errors.

           Therefore, we manually check response.ok.

           This allows us to handle:
           - 404 → username not found
           - 403 → rate limit / forbidden
           - other API errors
           ----------------------------------------------------- */

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit reached. Please try again later.",
        );
      }
      if (response.status === 404) {
        throw new Error("GitHub username could not be found.");
      }

      throw new Error(`GitHub API error: ${response.status}`);
    }

    // Convert the JSON response into a JavaScript object.

    const profileData = await response.json();

    // Return the processed API data to the next function.
    return {
      repositories: profileData.public_repos,
      followers: profileData.followers,
      following: profileData.following,
      avatar: profileData.avatar_url,
      profileUrl: profileData.html_url,
    };
  } catch (error) {
    /*
     * Re-throw the error instead of manipulating the UI here.
     *
     * Keeping fetching and UI rendering separate makes the
     * code easier to maintain and extend later.
     */
    throw error;
  }
}

/* =========================================================
   UPDATE GITHUB UI
   Takes the API data and injects it into our HTML.
   ========================================================= */

function updateGitHubUI(profile) {
  /*
   * The API response has now been converted into normal
   * JavaScript values.
   *
   * We update only the DOM elements that need the data.
   */

  githubRepos.textContent = profile.repositories;
  githubFollowers.textContent = profile.followers;
  githubFollowing.textContent = profile.following;

  /*
   * Update the existing "Visit GitHub" button so it points
   * directly to the fetched GitHub profile.
   */

  const githubLink = githubCard.querySelector(".secondary-link");

  if (githubLink) {
    githubLink.href = profile.profileUrl;
  }
  /*
   * Create an avatar dynamically from the API response.
   *
   * We only create it if an avatar doesn't already exist.
   */

  if (profile.avatar) {
    const avatar = document.createElement("img");

    avatar.src = profile.avatar;
    avatar.alt = `${GITHUB_USERNAME} GitHub avatar`;

    avatar.className = "github-avatar";

    /*
     * Insert the avatar near the top of the GitHub card.
     * CSS styling can be added later if we want a custom
     * avatar treatment.
     */

    githubCard.prepend(avatar);
  }
}

/* =========================================================
   ERROR UI
   Displays a clean fallback message if GitHub fails.
   ========================================================= */

function showGitHubError(error) {
  console.error("GitHub API Error:", error);

  /*
   * Instead of leaving the user with broken "--" values,
   * replace the stats with a friendly fallback state.
   */

  githubRepos.textContent = "_";
  githubFollowers.textContent = "_";
  githubFollowing.textContent = "_";

  /*
   * Create a small error message dynamically.
   */

  const errorMessage = document.createElement("p");

  errorMessage.className = "github-error";

  errorMessage.textContent = "GitHub stats are temporarily unavailable.";

  /*
   * Insert the message at the bottom of the GitHub card.
   */

  githubCard.append(errorMessage);
}

/* =========================================================
   MAIN INITIALIZER
   Controls the complete asynchronous workflow.
   ========================================================= */

   async function initializeGitHub() {
    try {
        /*
         * 1. Wait for GitHub API response.
         *
         * JavaScript pauses here until fetchGitHubProfile()
         * resolves with the profile data.
         */

        const profile = await fetchGitHubProfile();

        /*
         * 2. Once the data arrives successfully,
         * send it to the UI update function.
         */

        updateGitHubUI(profile);
    } catch (error) {
        /*
         * 3. If fetching or processing fails,
         * show the fallback UI instead of breaking the page.
         */

        showGitHubError(error);
    }
   }
   /* =========================================================
   START APPLICATION
   ========================================================= */

   initializeGitHub();
