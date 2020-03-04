---
title: How to publish artifact to Maven Central via Gradle
date: 2018-01-18 11:21:15
tags:
  - gradle
  - maven
  - kotlin
---

Publishing an artifact to the maven center in the JVM world is not as easy as publishing a package to NPM in the Javascript world. I think it might be good to share my experience along the road to save your time in the future. I use kotlin to write this package, but it works with any jvm language though, you just need to make the `build.gradle` to handle your file.

<!--more-->

## 0. First thing first.

No one can publish to maven central directly. You have to publish your artifact to an `approved repository`, then `release` to the Maven central.

`Sonatype OSS Nexus` is an approved repository hosted by Sonatype (the company that runs Maven Central) which provides free of charge specifically for open-source projects.

## 1. Sign up

You know the `namespace`, `package`, `groupId` concept, right? Your code should reside under certain namespace in order to prevent the naming collision. And when you want to upload your artifact, you need to have this too, and you need to raise a `jira` issue on `Sonatype` site to apply for it. So, first, you need to [**Sign up**](https://issues.sonatype.org/secure/Signup!default.jspa).

### Tips

- Sign up for your company email if you will apply for a group id which is the domain name of your company.
- Remember your username and password. It's not only used for raising the issue. But for uploading as well.

## 2. Apply for your namespace

[**Create an issue here**](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134) to apply for your namespace. It should be a reversed domain name. Your issue will be manually reviewed by a `Sonatype` employer. It should be fast, within 2 hours.

### Tips

After applying, you will gain permission for the following URLs:

- Repository: 'https://oss.sonatype.org/service/local/staging/deploy/maven2/
- Snapshot repository: https://oss.sonatype.org/content/repositories/snapshots/

## 3. Get the GPG key

If you use a mac, you should download [GPG Suite](https://gpgtools.org/). And install.

Then open the app and press `New` to create your key pair.

- Name is your `Sonatype` username.
- Email is the email you used to register `Sonatype`
- Remember the `password`, you will need it.
- Don't know whether the username and email need to match, but I followed it just in case.

After creating, right click your key and select `Send Public Key to Key Server` to public your public key.

Double click your key, it will show the detail on the right side. Take note of your `Key ID`.

In the terminal, use this command to get the secret key ring file:

> gpg --export-secret-keys YOUR-KEY-ID > secret-keys.gpg
> It will be generated under the folder where you run this command.

If you use `Windows` or other systems, you just need to know that you need to get the following 3 things in order to push any further:

- Key ID of your newly generated key pair
- Password for this key pair
- Secret key ring file with the name `secret-keys.gpg`

## 4. Save your secrets

Create your `gradle.properties` file or open it if you already have one, put the following things there:

```ini
nexusUsername=YOUR_SONATYPE_USER_NAME
nexusPassword=YOUR_SONATYPE_USER_PASSWORD

signing.keyId=KEY_ID
signing.password=KEY_PASSWORD
signing.secretKeyRingFile=/PATH/TO/SECRET/RING/FILE
```

### Tips

- In my case, my IDEA gradle settings can't find this file if I put it either in `.gradle` or `gradle` folder, I have to put it in the root.

- **ADD THIS FILE TO .gitignore file. YOU NEVER WANT TO RELEASE THIS TO THE REPO.**

## 5. Set up your project to upload

There is an official guide [here](http://central.sonatype.org/pages/gradle.html) using the `maven` gradle plugin, but I choose to use the `com.bmuschko.nexus` because it's easier to do that.

Below is the full code of `build.gradle` to the plugin, add it in addition to your current `gradle code`.

```groovy
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.bmuschko:gradle-nexus-plugin:2.3.1'
    }
}

apply plugin: 'com.bmuschko.nexus'

archivesBaseName = 'teachUpload-jvm'
group = "com.yourCompany.package"
version = "0.1"

modifyPom {
    project {
        name 'teachUpload'
        description 'Teaching how to use gradle.'
        url 'https://bitbucket.org/objdict/objjson'
        inceptionYear '2018'

        scm {
            url 'https://bitbucket.org/objdict/objjson'
            connection 'scm:https://bitbucket.org/objdict/objjson.git'
            developerConnection 'scm:git://bitbucket.org/objdict/objjson.git'
        }

        licenses {
            license {
                name 'The Apache Software License, Version 2.0'
                url 'http://www.apache.org/licenses/LICENSE-2.0.txt'
                distribution 'repo'
            }
        }

        developers {
            developer {
                id 'albertgao'
                name 'Albert Gao'
                email 'albert.gao@salect.co.nz'
            }
        }
    }
}

extraArchive {
    sources = true
    tests = true
    javadoc = true
}

nexus {
    sign = true
    repositoryUrl = 'https://oss.sonatype.org/service/local/staging/deploy/maven2/'
    snapshotRepositoryUrl = 'https://oss.sonatype.org/content/repositories/snapshots/'
}
```

### Tips

- You don't need to create the `sourcesJar` in the `build.gradle` which you put the above settings. `com.bmuschko.nexus` will add it for you.

## 6. Upload

The above code should a `uploadArchives` task to your gradle. It may reside in the `upload` category if you can't find it in your gradle side-panel of IDEA. Double click it to execute the task.

You may see the following error when you first upload:

> `Could not find metadata com.yourCompany.package:teachUpload-jvm/maven-metadata.xml in remote (https://oss.sonatype.org/service/local/staging/deploy/maven2/)`

- This is not an error, just an indication.
- Your package has already been uploaded if this is the only error.
- It's there because this is your first time, so no meta file on the server yet.

Congrats, after all these steps, your package has finally been uploaded into... `Sonatype OSS Nexus`...

## 7. Publish to Maven Central via gradle

We're going to need to use another gradle plugin called `Gradle Nexus Staging plugin`.
Just add the following gradle code:

```groovy
plugins {
    id 'io.codearte.nexus-staging' version '0.11.0'
}

nexusStaging {
    packageGroup = "org.mycompany" //optional if packageGroup == project.getGroup()
    stagingProfileId = "yourStagingProfileId" //when not defined will be got from server using "packageGroup"
}
```

Now several tasks will be added:

- **closeRepository** - closes an open repository with the uploaded artifacts. There should be just one open repository available in the staging profile (possible old/broken repositories can be dropped with Nexus GUI)
- **releaseRepository** - releases a closed repository (required to put artifacts to Maven Central aka The Central Repository)
- **closeAndReleaseRepository** - closes and releases a repository (an equivalent to closeRepository releaseRepository)
- **getStagingProfile** - gets and displays a staging profile id for a given package group. This is a diagnostic task to get the value and put it into the configuration closure as stagingProfileId.

Now you should already upload your artifacts to the nexus repo. All you need to do is to run the `closeAndReleaseRepository`, and your artifacts will be in the Maven Central soon.

Tips:

1. If you have a multiple project gradle setup. You just need to apply this plugin at the root level.

## 8. Publish to the Maven central via Nexus website

If you want to use Nexus website to publish instead of running the gradle task. Here is how to do it.

- Open [Nexus Repository Manager](https://oss.sonatype.org/#welcome)
- Click the `Log in` at upper right corner
- At the right side, click `Staging Repositories`
- Search your project by using this pattern: If your group id is `com.google`, then search for `comgoogle`.
- Select the right item and click the `Close` button to close it. It's like to finalize the uploading thing.
- Click the `Refresh` button to get the latest updates. Remember this trick, we are in 1980s, no ajax yet.
- If any errors:
  - You can inspect them at the `Activity` panel.
  - You need to `Drop` this upload
  - Fix them in your local folder
  - Run the `uploadArchives` task again.
  - Then `Close` then continue
- If no errors:
  - Click `Release` button

Real congrat now. Finally, your artifact has uploaded to Maven central.

## 9. Use it

In the `build.gradle` of project you want to use this package:

```groovy
repositories {
    mavenCentral()
}

dependencies {
    compile "com.yourCompany.package:teachUpload-jvm:0.1"
}
```

The pattern is: `Group-Id:archivesBaseName:Version number`

## 10. End

Don't know if I get something wrong. Welcome to new advice.
Now you get it. Everything is set up. Enjoy. :)

Thanks for reading!

Follow me (<a href='https://twitter.com/albertgao' target="_blank" rel="noopener noreferrer">albertgao</a>) on twitter, if you want to hear more about my interesting ideas.
