/**
 * Banner service for PerfectWorks CLI
 */
export class BannerService {
  /**
   * ASCII art banner for PerfectWorks CLI
   */
  private static readonly BANNER = `
  ___          __        _ __      __       _          ___ _    ___ 
 | _ \\___ _ _ / _|___ __| |\\ \\    / /__ _ _| |__ ___  / __| |  |_ _|
 |  _/ -_) '_|  _/ -_) _|  _\\ \\/\\/ / _ \\ '_| / /(_-< | (__| |__ | | 
 |_| \\___|_| |_| \\___\\__|\\__|\\_/\\_/\\___/_| |_\\_\\/__/  \\___|____|___|
                                                                    
`

  /**
   * Get the banner as a string
   */
  static get(): string {
    return this.BANNER
  }

  /**
   * Display the banner to console
   */
  static show(): void {
    console.log(this.BANNER)
  }
}
