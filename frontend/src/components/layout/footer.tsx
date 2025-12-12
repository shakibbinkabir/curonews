import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold">
              CuroNews
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated health news and research for curious minds.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/research" className="hover:text-primary">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/category/news" className="hover:text-primary">
                  News
                </Link>
              </li>
              <li>
                <Link href="/category/tips" className="hover:text-primary">
                  Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://t.me/curonews" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Telegram
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CuroNews. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
