import { request } from 'https'
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp'
import chalk from 'chalk'
import fs from 'fs'

const regex =
  />([0-9K+]{0,})<\/div><div class="[A-Za-z0-9]{0,10}">Downloads<\/div>/g

export function stringToNumber(number: string) {
  if (number.includes('K')) {
    return parseInt(number.replace('K', '')) * 1000
  } else if (number.includes('+')) {
    return parseInt(number.replace('+', '')) + 1
  } else {
    return parseInt(number)
  }
}

export async function playStoreDownloads(packageName: string) {
  try {
    const html = await fetch(
      `https://play.google.com/store/apps/details?id=${packageName}`
    ).then((res) => res.text())
    const result = regex.exec(html.match(regex)?.[0] ?? '')
    return result ? stringToNumber(result[1]) : null
  } catch (e) {
    return null
  }
}

export async function gitHubDownloads(
  owner: string,
  repo: string,
  release: string = 'latest',
  allReleases: boolean = false,
  assetsToCount: (asset: {
    name: string
    download_count: number
    [key: string]: any
  }) => boolean = () => true
) {
  try {
    if (allReleases) {
      const releases = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }
      ).then((res) => res.json())
      return releases
        .map((release: { assets: any[] }) =>
          release.assets
            .filter(assetsToCount)
            .reduce(
              (acc: number, asset: { download_count: number }) =>
                acc + asset.download_count,
              0
            )
        )
        .reduce((acc: number, downloads: number) => acc + downloads, 0)
    } else {
      const releaseData = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/${release}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }
      ).then((res) => res.json())
      return releaseData.assets
        .filter(assetsToCount)
        .reduce(
          (acc: number, asset: { download_count: number }) =>
            acc + asset.download_count,
          0
        )
    }
  } catch (e) {
    return 0
  }
}

export async function getImageBuffer(url: string) {
  return new Promise<Buffer>((resolve, reject) => {
    request(url, (res) => {
      const chunks: Uint8Array[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).end()
  })
}

export async function cacheImageLocally(props: {
  url?: string
  file?: string
  imageName: string
  path?: string
  svg?: boolean
  newWidth?: number
  newHeight?: number
}) {
  const { url, file, imageName: name, path, svg, newWidth, newHeight } = props

  const imageName = `${name.replace(/[^a-zA-Z0-9+#]/g, '_')}-${
    process.env.NEXT_PUBLIC_RUN_ID
  }`

  const internalPath = path ? `${path}/` : ''

  const log = (...message: string[]) =>
    console.log([chalk.bgYellow(chalk.black(`[Image]`)), ...message].join(' '))

  try {
    const relativeUrl = `/images/cached/${internalPath}${imageName}.${
      svg || (url ?? file)?.endsWith('svg') ? 'svg' : 'webp'
    }`
    const absoluteUrl = `${process.cwd()}/public${relativeUrl}`
    const publicRelativeUrl = `/images/cached/${internalPath}${encodeURIComponent(
      imageName
    )}.${svg || (url ?? file)?.endsWith('svg') ? 'svg' : 'webp'}`

    if (existsSync(absoluteUrl)) return publicRelativeUrl

    const buffer = url
      ? await getImageBuffer(url)
      : file
      ? fs.readFileSync(file)
      : null

    if (!buffer) return url ?? file ?? ''

    const key = (url ?? file)?.split('/').pop() ?? ''
    const fileName = relativeUrl.replace('/images/cached/', '')

    if (url)
      log(
        chalk.blue('Dwnld'),
        chalk.white(`  - ${new URL(url).host} ... ${key}`)
      )
    else if (file) log(chalk.blue('Cache'), chalk.white(`  - ${file}`))

    mkdirSync(`${process.cwd()}/public/images/cached/${internalPath}`, {
      recursive: true,
    })

    if ((file && svg) || file?.endsWith('.svg')) {
      fs.writeFileSync(absoluteUrl, buffer)

      const size = fs.fstatSync(fs.openSync(absoluteUrl, 'r')).size

      log(chalk.green('Cached'), chalk.white(`- ${key} -> ${fileName}`))
      log(chalk.cyan(`${(size ?? 0) / 1000} KB`))
      log()

      return publicRelativeUrl
    }

    if ((url && svg) || url?.endsWith('.svg')) {
      fs.writeFileSync(absoluteUrl, buffer)

      const size = fs.fstatSync(fs.openSync(absoluteUrl, 'r')).size

      log(chalk.green('Cached'), chalk.white(`\t- ${key} -> ${fileName}`))
      log(chalk.cyan(`${(size ?? 0) / 1000} KB`))
      log()
      return publicRelativeUrl
    }

    const image = sharp(buffer)
    const metadata = await image.metadata()
    const { width, height } = metadata
    const resizedImage = image.resize(newWidth ?? width, newHeight ?? height, {
      fit: 'contain',
      position: 'center',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })

    const output = await resizedImage.webp().toFile(absoluteUrl)
    const size = output.size / 1000

    log(chalk.green('Cached'), chalk.white(`\t- ${key} -> ${fileName}`))
    log(chalk.cyan(`${size} KB`))
    log()

    return publicRelativeUrl
  } catch (e) {
    log(chalk.red('Failed'), chalk.white(`\t- download ${url}\n${e}\n\n`))

    return url ?? file ?? ''
  }
}