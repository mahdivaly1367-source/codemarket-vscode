$ErrorActionPreference = 'Continue'
# Keep native command failures inspectable through $LASTEXITCODE, including expected 'not found' checks.
$PSNativeCommandUseErrorActionPreference = $false

$repo = 'mahdivaly1367-source/codemarket-vscode'
$repoUrl = "https://github.com/$repo.git"
$acceptedRemoteUrls = @($repoUrl, "https://github.com/$repo", 'git@github.com:mahdivaly1367-source/codemarket-vscode.git')

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git is not installed or is not available on PATH.'
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is not installed. Install it, sign in with gh auth login, then rerun this script.'
}

$currentUser = gh api user --jq .login 2>$null
if ($LASTEXITCODE -ne 0) {
    throw 'GitHub CLI is not authenticated. Run gh auth login, then rerun this script.'
}
if ($currentUser -ne 'mahdivaly1367-source') {
    throw "GitHub CLI is signed in as '$currentUser', but this project targets mahdivaly1367-source. Sign in with the intended account first."
}

$insideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $insideRepo -ne 'true') {
    git init -b main
    if ($LASTEXITCODE -ne 0) { throw 'Could not initialize Git.' }
}

$head = git rev-parse --verify HEAD 2>$null
$hasCommit = ($LASTEXITCODE -eq 0)
git add .
if ($LASTEXITCODE -ne 0) { throw 'Could not stage project files.' }

$pendingChanges = git status --porcelain
if (-not $hasCommit) {
    git commit -m 'feat: initial CodeMarket VS Code learning MVP'
    if ($LASTEXITCODE -ne 0) { throw 'Initial commit failed. Check Git identity and try again.' }
} elseif ($pendingChanges) {
    git commit -m 'chore: prepare CodeMarket GitHub publication'
    if ($LASTEXITCODE -ne 0) { throw 'Could not commit pending project changes. Check Git identity and inspect git status.' }
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    $remote = $null
}
if ($remote -and $remote -notin $acceptedRemoteUrls) {
    throw "An origin remote already points somewhere else: $remote. Refusing to overwrite it."
}

$existing = gh repo view $repo --json name -q .name 2>$null
$viewExit = $LASTEXITCODE
if ($viewExit -ne 0) {
    Write-Host "Creating an empty public GitHub repository $repo ..."
    gh repo create $repo --public
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not create the GitHub repository. Check gh auth status and whether the repository already exists.'
    }
}

if (-not $remote) {
    git remote add origin $repoUrl
    if ($LASTEXITCODE -ne 0) { throw 'Could not add origin remote.' }
}

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    throw 'Could not push main. If the remote contains an initial README/license, reconcile it manually; do not force-push.'
}

Write-Host "Done. Repository: https://github.com/$repo" -ForegroundColor Green
Write-Host 'Next: open docs/SESSION_HANDOFF.md before continuing in a new ChatGPT conversation.'

