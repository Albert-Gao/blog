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

You know the `namespace`, `package`, `groupId` concept, right? Your code should be reside under certain namespace in order to prevent naming collision. And when you want to upload your artifact, you need to have this too, and you need to raise an `jira` issue on `Sonatype` site to apply for it. So, first, you need to [**Sign up**](https://issues.sonatype.org/secure/Signup!default.jspa).

### Tips

- Sign up with your company email if you gonna apply for a group id which is the domain name of your company.
- Remember your user name and password. It's not only used for raising the issue. But for uploading as well.

## 2. Apply for your namespace

[**Create an issue here**](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134) to apply for your namespace. It should be a reversed domain name. Your issue will be manually review by a `Sonatype` employer. It should be fast, within 2 hours.

### Tips
After applying, you will gain permission for the following URLs:
- Repository: 'https://oss.sonatype.org/service/local/staging/deploy/maven2/
- Snapshot repository: https://oss.sonatype.org/content/repositories/snapshots/

## 3. Get the GPG key

If you use mac, you should download [GPG Suite](https://gpgtools.org/). And install.

Then open the app and press `New` to create your key pair.

- Name is your `Sonatype` user name.
- Email is the email you used to register `Sonatype`
- Remember the `password`, you gonna need it.
- Don't know whether the user name and email need to match, but I followed it just in case.

After creating, right click your key and select `Send Public Key to Key Server` to public your public key.

Double click your key, it will show the detail at the right side. Take note of your `Key ID`.

In the terminal, use this command to get the secret key ring file:
>gpg --export-secret-keys YOUR-KEY-ID > secret-keys.gpg
It will be generated under the folder where you run this command.

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
- To my case, my IDEA gradle settings can't find this file if I put it either in `.gradle` or `gradle` folder, I have to put it in the root.

- **ADD THIS FILE TO .gitignore file. YOU NEVER WANT TO RELEASE THIS TO THE REPO.**

## 5. Set up your project to upload

There is an official guide here using the `maven` gradle plugin, but I choose to use the `com.bmuschko.nexus` because it's more easy to do that.

Below is the full code of `build.gradle` to the plugin, add it in addition to your current `gradle code`.

```gradle
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

>`Could not find metadata com.yourCompany.package:teachUpload-jvm/maven-metadata.xml in remote (https://oss.sonatype.org/service/local/staging/deploy/maven2/)`

- This is not an error, just an indication.
- Your package has already been uploaded if this is the only error.
- It's there because this is your first time, so no meta file on the server yet.

Congrats, after all these steps, your package has finally been uploaded into... `Sonatype OSS Nexus`...

## 7. Go publish to the Maven central

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

## 8. Use it

In the `build.gradle` of project you want to use this package:

```gradle
repositories {
    mavenCentral()
}

dependencies {
    compile "com.yourCompany.package:teachUpload-jvm:0.1"
}
```

The pattern is: `Group-Id:archivesBaseName:Version number`

## 9. Where to go

OK, the step that we can improve here is step 7. Consider that every time you publish your package, you need to do it again. OMG

People online said, you can upload to `JCenter` to do the auto-sync, but it seems `JFrog`(company who runs `JCenter`?) chooses to ask for a `150USD/Month` fee for my account, so I went for the official way. If you have a `CI` or `CD` procedure, I think you need to figure out a auto-way to do this. 

Don't know if I get something wrong. Welcome for new advice.

## End

Now you get it. Everything is setup. Enjoy. :)