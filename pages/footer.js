import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Footer() {
  return (
    <div className={styles.container}>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
        <div>Illustration by <a href="https://icons8.com/illustrations/author/u7l2K4BCiAa9">Natasha Remarchuk</a> from <a href="https://icons8.com/illustrations">Ouch!</a></div>
      </footer>

    </div>
  )
}
