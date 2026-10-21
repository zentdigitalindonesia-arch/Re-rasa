param([string]$Message = 'Update website RE RASA')
$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/zentdigitalindonesia-arch/Re-rasa.git'
$source = $PSScriptRoot
function GitRun([string[]]$GitArgs) { & git @GitArgs; if($LASTEXITCODE -ne 0){throw 'Perintah Git gagal. Tidak ada force push yang dilakukan.'} }
& gh auth status 2>$null
if($LASTEXITCODE -ne 0){throw 'Login dahulu: gh auth login --hostname github.com --web --git-protocol https. Gunakan akun pemilik atau kolaborator yang memiliki izin tulis.'}
$canPush = & gh api repos/zentdigitalindonesia-arch/Re-rasa --jq '.permissions.push'
if($LASTEXITCODE -ne 0 -or $canPush -ne 'true'){throw 'Akun GitHub aktif belum memiliki izin push ke Re-rasa.'}
$private = Join-Path $source '.rerasa-private'
New-Item -ItemType Directory -Path $private -Force | Out-Null
$checkout = Join-Path $private 'github-publish'
if(!(Test-Path -LiteralPath (Join-Path $checkout '.git'))){GitRun @('clone',$repo,$checkout)}
$remote = & git -C $checkout remote get-url origin
if($remote -ne $repo){throw 'Remote checkout berbeda dari repository tujuan.'}
GitRun @('-C',$checkout,'checkout','main')
$pending = & git -C $checkout status --porcelain
if($pending){throw 'Checkout publikasi memiliki perubahan belum selesai. Periksa sebelum melanjutkan.'}
GitRun @('-C',$checkout,'pull','--ff-only','origin','main')
$files = Get-ChildItem -LiteralPath $source -File -Force | Where-Object { $_.Name -match '\.(html|css|js|cjs|mjs|json|md|cmd|ps1)$' -or $_.Name -in @('.gitignore','.vercelignore','.env.example') }
foreach($folder in @('api','assets','public','supabase')){
 $dir=Join-Path $source $folder
 if(Test-Path -LiteralPath $dir){$files += Get-ChildItem -LiteralPath $dir -Recurse -File -Force | Where-Object { $_.FullName -notmatch '[\\/](uploads|node_modules|\.rerasa-private|cadangan[^\\/]*)[\\/]' -and $_.Extension -match '^\.(html|css|js|json|md|sql|svg|png|jpg|jpeg|webp|glb|mp3|wav|ogg|mp4|webm|vtt|txt)$' }}
}
$paths=@()
foreach($file in $files){if($file.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Symlink tidak diunggah.'};if($file.Name -eq 'guests.json'){continue};$rel=$file.FullName.Substring($source.Length+1);$dest=Join-Path $checkout $rel;New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null;Copy-Item -LiteralPath $file.FullName -Destination $dest -Force;$paths+=$rel}
foreach($rel in $paths){GitRun @('-C',$checkout,'add','--',$rel)}
& git -C $checkout diff --cached --quiet
if($LASTEXITCODE -eq 0){Write-Host 'Tidak ada perubahan kode.';exit 0}
GitRun @('-C',$checkout,'diff','--cached','--stat')
GitRun @('-C',$checkout,'-c','user.name=RE RASA Publisher','-c','user.email=342937126+zentdigitalindonesia-arch@users.noreply.github.com','commit','-m',$Message)
GitRun @('-C',$checkout,'push','origin','main')
Write-Host 'GitHub diperbarui. Periksa deployment otomatis di Vercel sebelum mengumumkan perubahan.'
