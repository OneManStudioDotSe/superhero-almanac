# Superhero API - Android Integration Guide

## API Base URL
```
https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/
```

## Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /all.json` | Fetch all 563 superheroes |
| `GET /id/{id}.json` | Get specific hero by ID |
| `GET /powerstats/{id}.json` | Get hero power stats |
| `GET /appearance/{id}.json` | Get hero appearance |
| `GET /biography/{id}.json` | Get hero biography |
| `GET /connections/{id}.json` | Get hero connections |
| `GET /work/{id}.json` | Get hero work info |

---

## Option 1: Retrofit (Recommended)

### Dependencies

```kotlin
// build.gradle.kts (app)
dependencies {
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Image loading
    implementation("io.coil-kt:coil:2.5.0")

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
}
```

### Data Models

```kotlin
// models/Superhero.kt
data class Superhero(
    val id: Int,
    val name: String,
    val slug: String,
    val powerstats: Powerstats,
    val appearance: Appearance,
    val biography: Biography,
    val work: Work,
    val connections: Connections,
    val images: Images
)

data class Powerstats(
    val intelligence: Int,
    val strength: Int,
    val speed: Int,
    val durability: Int,
    val power: Int,
    val combat: Int
)

data class Appearance(
    val gender: String,
    val race: String?,
    val height: List<String>,
    val weight: List<String>,
    val eyeColor: String,
    val hairColor: String
)

data class Biography(
    val fullName: String,
    val alterEgos: String,
    val aliases: List<String>,
    val placeOfBirth: String,
    val firstAppearance: String,
    val publisher: String?,
    val alignment: String
)

data class Work(
    val occupation: String,
    val base: String
)

data class Connections(
    val groupAffiliation: String,
    val relatives: String
)

data class Images(
    val xs: String,  // 48x48
    val sm: String,  // 96x96
    val md: String,  // 320x320
    val lg: String   // 480x480
)
```

### API Interface

```kotlin
// api/SuperheroApi.kt
import retrofit2.http.GET
import retrofit2.http.Path

interface SuperheroApi {
    @GET("all.json")
    suspend fun getAllHeroes(): List<Superhero>

    @GET("id/{id}.json")
    suspend fun getHeroById(@Path("id") id: Int): Superhero

    @GET("powerstats/{id}.json")
    suspend fun getPowerstats(@Path("id") id: Int): Powerstats

    @GET("biography/{id}.json")
    suspend fun getBiography(@Path("id") id: Int): Biography
}
```

### Retrofit Client

```kotlin
// api/RetrofitClient.kt
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/"

    val api: SuperheroApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SuperheroApi::class.java)
    }
}
```

### ViewModel

```kotlin
// viewmodel/HeroListViewModel.kt
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HeroListViewModel : ViewModel() {
    private val _heroes = MutableStateFlow<List<Superhero>>(emptyList())
    val heroes: StateFlow<List<Superhero>> = _heroes.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadHeroes()
    }

    fun loadHeroes() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                _heroes.value = RetrofitClient.api.getAllHeroes()
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun searchHeroes(query: String) {
        viewModelScope.launch {
            val allHeroes = RetrofitClient.api.getAllHeroes()
            _heroes.value = allHeroes.filter {
                it.name.contains(query, ignoreCase = true)
            }
        }
    }

    fun filterByAlignment(alignment: String) {
        viewModelScope.launch {
            val allHeroes = RetrofitClient.api.getAllHeroes()
            _heroes.value = allHeroes.filter {
                it.biography.alignment == alignment
            }
        }
    }
}
```

---

## Option 2: Ktor Client (Kotlin-first)

### Dependencies

```kotlin
// build.gradle.kts (app)
dependencies {
    implementation("io.ktor:ktor-client-android:2.3.7")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.7")
}
```

### Client Setup

```kotlin
// api/SuperheroClient.kt
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

object SuperheroClient {
    private const val BASE_URL = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api"

    private val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    suspend fun getAllHeroes(): List<Superhero> {
        return client.get("$BASE_URL/all.json").body()
    }

    suspend fun getHeroById(id: Int): Superhero {
        return client.get("$BASE_URL/id/$id.json").body()
    }
}
```

---

## Option 3: With Room for Offline Caching

### Dependencies

```kotlin
// build.gradle.kts (app)
plugins {
    id("com.google.devtools.ksp") version "1.9.21-1.0.15"
}

dependencies {
    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")
}
```

### Room Entity

```kotlin
// database/HeroEntity.kt
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "heroes")
data class HeroEntity(
    @PrimaryKey val id: Int,
    val name: String,
    val slug: String,
    val publisher: String?,
    val alignment: String,
    val imageUrl: String,
    val intelligence: Int,
    val strength: Int,
    val speed: Int,
    val durability: Int,
    val power: Int,
    val combat: Int,
    val fullName: String?,
    val race: String?,
    val gender: String?
)

// Extension function to convert API model to Entity
fun Superhero.toEntity() = HeroEntity(
    id = id,
    name = name,
    slug = slug,
    publisher = biography.publisher,
    alignment = biography.alignment,
    imageUrl = images.md,
    intelligence = powerstats.intelligence,
    strength = powerstats.strength,
    speed = powerstats.speed,
    durability = powerstats.durability,
    power = powerstats.power,
    combat = powerstats.combat,
    fullName = biography.fullName,
    race = appearance.race,
    gender = appearance.gender
)
```

### DAO

```kotlin
// database/HeroDao.kt
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface HeroDao {
    @Query("SELECT * FROM heroes ORDER BY name ASC")
    fun getAllHeroes(): Flow<List<HeroEntity>>

    @Query("SELECT * FROM heroes WHERE id = :id")
    suspend fun getHeroById(id: Int): HeroEntity?

    @Query("SELECT * FROM heroes WHERE alignment = :alignment")
    fun getHeroesByAlignment(alignment: String): Flow<List<HeroEntity>>

    @Query("SELECT * FROM heroes WHERE publisher = :publisher")
    fun getHeroesByPublisher(publisher: String): Flow<List<HeroEntity>>

    @Query("SELECT * FROM heroes WHERE name LIKE '%' || :query || '%'")
    fun searchHeroes(query: String): Flow<List<HeroEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(heroes: List<HeroEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(hero: HeroEntity)

    @Query("DELETE FROM heroes")
    suspend fun deleteAll()
}
```

### Database

```kotlin
// database/HeroDatabase.kt
import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [HeroEntity::class], version = 1, exportSchema = false)
abstract class HeroDatabase : RoomDatabase() {
    abstract fun heroDao(): HeroDao
}
```

### Repository

```kotlin
// repository/HeroRepository.kt
import kotlinx.coroutines.flow.Flow

class HeroRepository(
    private val api: SuperheroApi,
    private val dao: HeroDao
) {
    fun getHeroes(): Flow<List<HeroEntity>> = dao.getAllHeroes()

    fun searchHeroes(query: String): Flow<List<HeroEntity>> = dao.searchHeroes(query)

    fun getHeroesByAlignment(alignment: String): Flow<List<HeroEntity>> =
        dao.getHeroesByAlignment(alignment)

    suspend fun refreshHeroes() {
        try {
            val heroes = api.getAllHeroes()
            dao.deleteAll()
            dao.insertAll(heroes.map { it.toEntity() })
        } catch (e: Exception) {
            // Handle error - data will still be available from cache
            throw e
        }
    }

    suspend fun getHeroById(id: Int): HeroEntity? {
        return dao.getHeroById(id)
    }
}
```

---

## Recommended Project Structure

```
app/
├── data/
│   ├── remote/
│   │   ├── SuperheroApi.kt
│   │   ├── RetrofitClient.kt
│   │   └── dto/
│   │       └── Superhero.kt
│   ├── local/
│   │   ├── HeroDatabase.kt
│   │   ├── HeroDao.kt
│   │   └── entity/
│   │       └── HeroEntity.kt
│   └── repository/
│       └── HeroRepository.kt
├── di/
│   └── AppModule.kt          # Dependency injection (Hilt/Koin)
├── domain/
│   ├── model/
│   │   └── Hero.kt           # Domain model
│   └── usecase/
│       ├── GetHeroesUseCase.kt
│       ├── GetHeroByIdUseCase.kt
│       └── SearchHeroesUseCase.kt
└── ui/
    ├── list/
    │   ├── HeroListScreen.kt
    │   ├── HeroListViewModel.kt
    │   └── components/
    │       └── HeroCard.kt
    ├── detail/
    │   ├── HeroDetailScreen.kt
    │   └── HeroDetailViewModel.kt
    └── theme/
        └── Theme.kt
```

---

## Image Loading with Coil (Jetpack Compose)

```kotlin
// In your Composable
import coil.compose.AsyncImage

@Composable
fun HeroCard(hero: Superhero) {
    Card {
        AsyncImage(
            model = hero.images.md,
            contentDescription = hero.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
        )
        Text(text = hero.name)
        Text(text = hero.biography.publisher ?: "Unknown")
    }
}
```

---

## Quick Reference

| Library | Purpose | Recommendation |
|---------|---------|----------------|
| **Retrofit** | HTTP client | Most projects |
| **Ktor** | HTTP client | Kotlin Multiplatform |
| **Room** | Local database | Offline support |
| **Coil** | Image loading | Kotlin-first |
| **Glide** | Image loading | Java/legacy |
| **Hilt** | Dependency injection | Google recommended |
| **Koin** | Dependency injection | Simpler setup |

---

## API Response Example

```json
{
  "id": 1,
  "name": "A-Bomb",
  "slug": "1-a-bomb",
  "powerstats": {
    "intelligence": 38,
    "strength": 100,
    "speed": 17,
    "durability": 80,
    "power": 24,
    "combat": 64
  },
  "appearance": {
    "gender": "Male",
    "race": "Human",
    "height": ["6'8", "203 cm"],
    "weight": ["980 lb", "441 kg"],
    "eyeColor": "Yellow",
    "hairColor": "No Hair"
  },
  "biography": {
    "fullName": "Richard Milhouse Jones",
    "alterEgos": "No alter egos found.",
    "aliases": ["Rick Jones"],
    "placeOfBirth": "Scarsdale, Arizona",
    "firstAppearance": "Hulk Vol 2 #2 (April, 2008)",
    "publisher": "Marvel Comics",
    "alignment": "good"
  },
  "work": {
    "occupation": "Musician, adventurer",
    "base": "-"
  },
  "connections": {
    "groupAffiliation": "Hulk Family",
    "relatives": "Marlo Chandler-Jones (wife)"
  },
  "images": {
    "xs": "https://cdn.jsdelivr.net/.../xs/1-a-bomb.jpg",
    "sm": "https://cdn.jsdelivr.net/.../sm/1-a-bomb.jpg",
    "md": "https://cdn.jsdelivr.net/.../md/1-a-bomb.jpg",
    "lg": "https://cdn.jsdelivr.net/.../lg/1-a-bomb.jpg"
  }
}
```
