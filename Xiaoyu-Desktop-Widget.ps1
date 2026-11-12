param([switch]$ShowOnly)
$ErrorActionPreference = 'Stop'

Add-Type @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public static class XiaoyuWidget {
    private delegate bool WindowVisitor(IntPtr window, IntPtr data);
    [DllImport("user32.dll")] private static extern bool EnumWindows(WindowVisitor visitor, IntPtr data);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr window);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetWindowText(IntPtr window, StringBuilder text, int length);
    [DllImport("user32.dll", SetLastError = true)] public static extern bool SetWindowPos(IntPtr window, IntPtr after, int x, int y, int width, int height, uint flags);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr window, int command);
    public static IntPtr Find() {
        IntPtr match = IntPtr.Zero;
        EnumWindows(delegate(IntPtr window, IntPtr data) {
            if (!IsWindowVisible(window)) return true;
            StringBuilder title = new StringBuilder(256);
            GetWindowText(window, title, title.Capacity);
            if (!title.ToString().StartsWith("Xiaoyu Desktop Widget", StringComparison.Ordinal)) return true;
            match = window;
            return false;
        }, IntPtr.Zero);
        return match;
    }
}
"@

if ($ShowOnly) { return }

$window = [XiaoyuWidget]::Find()
if ($window -eq [IntPtr]::Zero) {
    $locations = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
        "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
    )
    $edge = $locations | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $edge) { throw 'Microsoft Edge was not found.' }

    $url = 'https://xyuer0811-arch.github.io/work-planner/index.html?view=focus&widget=windows'
    Start-Process -FilePath $edge -ArgumentList "--app=$url"
    $deadline = (Get-Date).AddSeconds(25)
    do {
        Start-Sleep -Milliseconds 300
        $window = [XiaoyuWidget]::Find()
    } until ($window -ne [IntPtr]::Zero -or (Get-Date) -ge $deadline)
    if ($window -eq [IntPtr]::Zero) { throw 'The widget window did not load. Check your connection and try again.' }
}

Add-Type -AssemblyName System.Windows.Forms
$area = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$width = [Math]::Min(400, $area.Width - 32)
$height = [Math]::Min(620, $area.Height - 32)
$x = $area.Right - $width - 16
$y = $area.Top + 16
[void][XiaoyuWidget]::ShowWindow($window, 9)
if (-not [XiaoyuWidget]::SetWindowPos($window, [IntPtr](-1), $x, $y, $width, $height, 0x0040)) {
    throw 'Windows could not pin the widget.'
}
