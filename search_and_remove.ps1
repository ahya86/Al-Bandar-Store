# Remove ALL original-price and discount-badge lines from all product HTML files
$files = Get-ChildItem -Name "product*.html"

Write-Host "Processing files to remove ALL original-price and discount-badge lines..."
$processedCount = 0
$modifiedCount = 0

foreach ($file in $files) {
    $processedCount++
    Write-Host "Processing $file ($processedCount/$($files.Count))"

    $content = Get-Content $file -Raw
    $originalContent = $content
    $modified = $false

    # Remove ALL original price lines (any price amount)
    $originalPriceRegex = '<span class="original-price"[^>]*>.*?</span>'
    if ($content -match $originalPriceRegex) {
        $content = $content -replace $originalPriceRegex, ""
        $modified = $true
        Write-Host "  - Removed original price line(s)"
    }

    # Remove ALL discount badge lines (any discount percentage)
    $discountBadgeRegex = '<span class="discount-badge"[^>]*>.*?</span>'
    if ($content -match $discountBadgeRegex) {
        $content = $content -replace $discountBadgeRegex, ""
        $modified = $true
        Write-Host "  - Removed discount badge line(s)"
    }

    # Clean up any extra whitespace or empty lines that might be left
    $content = $content -replace '\r?\n\s*\r?\n\s*\r?\n', "`r`n`r`n"

    # Save the file if it was modified
    if ($modified) {
        $content | Set-Content $file -NoNewline
        $modifiedCount++
        Write-Host "  - File saved"
    }
}

Write-Host ""
Write-Host "Processing complete!"
Write-Host "Files processed: $processedCount"
Write-Host "Files modified: $modifiedCount"
