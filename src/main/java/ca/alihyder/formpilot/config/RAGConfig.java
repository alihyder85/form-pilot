package ca.alihyder.formpilot.config;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.TokenWindowChatMemory;
import dev.langchain4j.model.TokenCountEstimator;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.HuggingFaceTokenCountEstimator;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.ConcurrentHashMap;

import static dev.langchain4j.data.document.loader.FileSystemDocumentLoader.loadDocument;

@Slf4j
@Configuration
public class RAGConfig {

    @Value("${formpilot.rag.max-results:3}")
    private int maxResults;

    @Value("${formpilot.rag.min-score:0.4}")
    private double minScore;

    @Value("${formpilot.rag.chunk-size:1000}")
    private int chunkSize;

    @Value("${formpilot.rag.chunk-overlap:200}")
    private int chunkOverlap;

    private final ConcurrentHashMap<String, Long> documentVersions = new ConcurrentHashMap<>();

    @Bean
    public TokenCountEstimator tokenCountEstimator(){
        return new HuggingFaceTokenCountEstimator();
    }

    @Bean
    ChatMemoryProvider chatMemoryProvider(TokenCountEstimator tokenizer) {
        return memoryId -> TokenWindowChatMemory.builder()
            .id(memoryId)
            .maxTokens(10_000, tokenizer)
            .build();
    }

    @Bean
    EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    @Bean
    EmbeddingStore<TextSegment> embeddingStore(EmbeddingModel embeddingModel, ResourceLoader resourceLoader) throws IOException {
        log.info("Initializing embedding store with RAG configuration");

        InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

        // Load user data from content file
        Resource resource = resourceLoader.getResource("classpath:content.txt");
        if (!resource.exists()) {
            log.warn("content.txt not found. Creating empty embedding store.");
            return embeddingStore;
        }

        Path contentPath = resource.getFile().toPath();
        Document document = loadDocument(contentPath, new TextDocumentParser());

        // Track document version for potential updates
        documentVersions.put("content.txt", Files.getLastModifiedTime(contentPath).toMillis());

        log.info("Loading document: {} (size: {} bytes)",
            document.metadata().getString("file_name"),
            document.text().length());

        // Configure document splitting for optimal retrieval
        DocumentSplitter splitter = DocumentSplitters.recursive(chunkSize, chunkOverlap);

        // Ingest document into embedding store
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
            .documentSplitter(splitter)
            .embeddingModel(embeddingModel)
            .embeddingStore(embeddingStore)
            .build();

        ingestor.ingest(document);

        return embeddingStore;
    }

    @Bean
    ContentRetriever contentRetriever(EmbeddingStore<TextSegment> embeddingStore,
                                      EmbeddingModel embeddingModel) {
        log.info("Creating content retriever with maxResults={}, minScore={}", maxResults, minScore);

        return EmbeddingStoreContentRetriever.builder()
            .embeddingStore(embeddingStore)
            .embeddingModel(embeddingModel)
            .maxResults(maxResults)
            .minScore(minScore)
            .build();
    }

    @PostConstruct
    public void logConfiguration() {
        log.info("RAG Configuration initialized:");
        log.info("- Max Results: {}", maxResults);
        log.info("- Min Score: {}", minScore);
        log.info("- Chunk Size: {}", chunkSize);
        log.info("- Chunk Overlap: {}", chunkOverlap);
    }
}